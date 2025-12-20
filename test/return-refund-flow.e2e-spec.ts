import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { ReturnsService } from '../src/returns/returns.service';
import { RefundsService } from '../src/refunds/refunds.service';
import { WalletService } from '../src/wallet/wallet.service';
import { FileUploadService } from '../src/common/services/file-upload.service';
import { ReturnStatus, OrderStatus } from '@prisma/client';

describe('Return & Refund Flow Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let returnsService: ReturnsService;
  let refundsService: RefundsService;
  let walletService: WalletService;

  let testUserId: string;
  let testProductId: string;
  let testOrderId: string;
  let testOrderItemId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        ReturnsService,
        RefundsService,
        WalletService,
        {
          provide: FileUploadService,
          useValue: {
            uploadMultipleImages: jest
              .fn()
              .mockResolvedValue([{ url: 'https://test.com/image1.jpg' }]),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    returnsService = moduleFixture.get<ReturnsService>(ReturnsService);
    refundsService = moduleFixture.get<RefundsService>(RefundsService);
    walletService = moduleFixture.get<WalletService>(WalletService);

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'CUSTOMER',
      },
    });
    testUserId = user.id;

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: `test-category-${Date.now()}`,
      },
    });

    // Create test product with stock
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
        sku: `TEST-SKU-${Date.now()}`,
        categoryId: category.id,
        regularPrice: 1000,
        salePrice: 800,
        stockQuantity: 20,
        status: 'ACTIVE',
      },
    });
    testProductId = product.id;

    // Create test order (DELIVERED)
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId: testUserId,
        status: OrderStatus.DELIVERED,
        paymentStatus: 'PAID',
        subtotal: 4000,
        total: 4000,
        shippingAddress: { address: 'Test Address' },
        billingAddress: { address: 'Test Address' },
        trackingStatus: 'DELIVERED',
        updatedAt: new Date(), // Set to now for time limit tests
      },
    });
    testOrderId = order.id;

    // Create test order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: testOrderId,
        productId: testProductId,
        quantity: 5,
        price: 800,
        productSnapshot: { name: 'Test Product' },
        status: 'PLACED',
      },
    });
    testOrderItemId = orderItem.id;
  }

  async function cleanupTestData() {
    // Delete in reverse order of foreign keys
    await prisma.returnItem.deleteMany({});
    await prisma.return.deleteMany({ where: { userId: testUserId } });
    await prisma.refund.deleteMany({ where: { userId: testUserId } });
    await prisma.walletTransaction.deleteMany({});
    await prisma.wallet.deleteMany({ where: { userId: testUserId } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
    await prisma.order.deleteMany({ where: { userId: testUserId } });
    await prisma.product.deleteMany({ where: { id: testProductId } });
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({ where: { id: testUserId } });
  }

  describe('Test 1: Return Time Limit Validation', () => {
    it('should reject return request for order older than 30 days', async () => {
      // Update order to be 31 days old
      await prisma.order.update({
        where: { id: testOrderId },
        data: {
          updatedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        },
      });

      const returnRequest = {
        orderId: testOrderId,
        reason: 'Defective product',
        type: 'RETURN' as any,
        items: [{ orderItemId: testOrderItemId, quantity: 1 }],
      };

      await expect(
        returnsService.requestReturn(testUserId, returnRequest, []),
      ).rejects.toThrow(/within 30 days/);

      // Reset order date for other tests
      await prisma.order.update({
        where: { id: testOrderId },
        data: { updatedAt: new Date() },
      });
    });

    it('should accept return request for order within 30 days', async () => {
      const returnRequest = {
        orderId: testOrderId,
        reason: 'Changed my mind',
        type: 'RETURN' as any,
        items: [{ orderItemId: testOrderItemId, quantity: 1 }],
      };

      const result = await returnsService.requestReturn(
        testUserId,
        returnRequest,
        [],
      );

      expect(result).toBeDefined();
      expect(result.status).toBe(ReturnStatus.REQUESTED);
    });
  });

  describe('Test 2: Partial Return Quantity Protection', () => {
    it('should prevent over-returning items cumulatively', async () => {
      // First return: 3 units (should succeed)
      const return1 = await returnsService.requestReturn(
        testUserId,
        {
          orderId: testOrderId,
          reason: 'First return',
          type: 'RETURN' as any,
          items: [{ orderItemId: testOrderItemId, quantity: 3 }],
        },
        [],
      );
      expect(return1).toBeDefined();

      // Second return: 3 units (should FAIL - exceeds 5 total)
      await expect(
        returnsService.requestReturn(
          testUserId,
          {
            orderId: testOrderId,
            reason: 'Second return',
            type: 'RETURN' as any,
            items: [{ orderItemId: testOrderItemId, quantity: 3 }],
          },
          [],
        ),
      ).rejects.toThrow(/Already returned 3 out of 5/);

      // Third return: 2 units (should succeed - total 5)
      const return3 = await returnsService.requestReturn(
        testUserId,
        {
          orderId: testOrderId,
          reason: 'Third return',
          type: 'RETURN' as any,
          items: [{ orderItemId: testOrderItemId, quantity: 2 }],
        },
        [],
      );
      expect(return3).toBeDefined();

      // Fourth return: 1 unit (should FAIL - all 5 already returned)
      await expect(
        returnsService.requestReturn(
          testUserId,
          {
            orderId: testOrderId,
            reason: 'Fourth return',
            type: 'RETURN' as any,
            items: [{ orderItemId: testOrderItemId, quantity: 1 }],
          },
          [],
        ),
      ).rejects.toThrow(/Already returned 5 out of 5/);
    });
  });

  describe('Test 3: Double Refund Prevention', () => {
    it('should prevent refund execution on already-refunded return', async () => {
      // Create and accept a return
      const returnRequest = await returnsService.requestReturn(
        testUserId,
        {
          orderId: testOrderId,
          reason: 'Test refund',
          type: 'RETURN' as any,
          items: [{ orderItemId: testOrderItemId, quantity: 1 }],
        },
        [],
      );

      await returnsService.updateStatus(
        returnRequest.id,
        ReturnStatus.ACCEPTED,
      );

      // First refund (should succeed)
      const refund1 = await refundsService.executeRefund({
        returnId: returnRequest.id,
        amount: 800,
        method: 'WALLET' as any,
        transactionId: 'TXN-TEST-1',
        adminRemarks: 'Approved',
      });
      expect(refund1).toBeDefined();

      // Second refund attempt (should FAIL)
      await expect(
        refundsService.executeRefund({
          returnId: returnRequest.id,
          amount: 800,
          method: 'WALLET' as any,
          transactionId: 'TXN-TEST-2',
          adminRemarks: 'Duplicate',
        }),
      ).rejects.toThrow(/already been processed/);
    });

    it('should not show refunded returns in pending list', async () => {
      const pendingRefunds = await refundsService.findPendingRefunds();

      const refundedReturnIds = await prisma.return.findMany({
        where: { refund: { isNot: null } },
        select: { id: true },
      });

      const pendingIds = pendingRefunds.map((r) => r.id);
      const refundedIds = refundedReturnIds.map((r) => r.id);

      // No overlap between pending and refunded
      const overlap = pendingIds.filter((id) => refundedIds.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  describe('Test 4: Stock Restoration (Only Once)', () => {
    it('should restore stock exactly once when return is accepted', async () => {
      // Get initial stock
      const initialProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      const initialStock = initialProduct.stockQuantity;

      // Create return request
      const returnRequest = await returnsService.requestReturn(
        testUserId,
        {
          orderId: testOrderId,
          reason: 'Stock test',
          type: 'RETURN' as any,
          items: [{ orderItemId: testOrderItemId, quantity: 2 }],
        },
        [],
      );

      // Stock should NOT change after return request
      const afterRequestProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(afterRequestProduct.stockQuantity).toBe(initialStock);

      // Accept return (stock should be restored here)
      await returnsService.updateStatus(
        returnRequest.id,
        ReturnStatus.ACCEPTED,
      );

      const afterAcceptProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(afterAcceptProduct.stockQuantity).toBe(initialStock + 2);

      // Execute refund (stock should NOT change again)
      await refundsService.executeRefund({
        returnId: returnRequest.id,
        amount: 1600,
        method: 'WALLET' as any,
        transactionId: 'TXN-STOCK-TEST',
      });

      const afterRefundProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(afterRefundProduct.stockQuantity).toBe(initialStock + 2); // Still +2, not +4
    });
  });

  describe('Test 5: State Transition Validation', () => {
    it('should reject invalid state transitions', async () => {
      const returnRequest = await returnsService.requestReturn(
        testUserId,
        {
          orderId: testOrderId,
          reason: 'State test',
          type: 'RETURN' as any,
          items: [{ orderItemId: testOrderItemId, quantity: 1 }],
        },
        [],
      );

      // Invalid: REQUESTED → REFUNDED
      await expect(
        returnsService.updateStatus(returnRequest.id, ReturnStatus.REFUNDED),
      ).rejects.toThrow(/refund endpoint/);

      // Valid: REQUESTED → UNDER_REVIEW
      const updated = await returnsService.updateStatus(
        returnRequest.id,
        ReturnStatus.UNDER_REVIEW,
      );
      expect(updated.status).toBe(ReturnStatus.UNDER_REVIEW);

      // Invalid: UNDER_REVIEW → REQUESTED (backwards)
      await expect(
        returnsService.updateStatus(returnRequest.id, ReturnStatus.REQUESTED),
      ).rejects.toThrow(/Invalid status transition/);
    });
  });

  describe('Test 6: Wallet Balance Atomicity', () => {
    it('should credit wallet atomically during refund', async () => {
      // Get initial wallet balance
      const initialWallet =
        await walletService.getUserWalletDetails(testUserId);
      const initialBalance = initialWallet?.balance || 0;

      // Create, accept, and refund a return
      const returnRequest = await returnsService.requestReturn(
        testUserId,
        {
          orderId: testOrderId,
          reason: 'Wallet test',
          type: 'RETURN' as any,
          items: [{ orderItemId: testOrderItemId, quantity: 1 }],
        },
        [],
      );

      await returnsService.updateStatus(
        returnRequest.id,
        ReturnStatus.ACCEPTED,
      );

      const refundAmount = 800;
      await refundsService.executeRefund({
        returnId: returnRequest.id,
        amount: refundAmount,
        method: 'WALLET' as any,
        transactionId: 'TXN-WALLET-TEST',
      });

      // Verify wallet balance increased by exactly refund amount
      const finalWallet = await walletService.getUserWalletDetails(testUserId);
      expect(finalWallet.balance).toBe(initialBalance + refundAmount);

      // Verify wallet transaction created
      expect(finalWallet.transactions).toContainEqual(
        expect.objectContaining({
          amount: refundAmount,
          type: 'CREDIT',
          relatedId: returnRequest.id,
        }),
      );
    });
  });
});
