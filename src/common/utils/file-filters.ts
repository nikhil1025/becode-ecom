
import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(
      new BadRequestException('Only image files (jpg, jpeg, png) are allowed!'),
      false,
    );
  }
  callback(null, true);
};
