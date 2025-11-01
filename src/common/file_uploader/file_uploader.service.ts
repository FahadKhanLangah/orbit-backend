/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { BadRequestException, Injectable } from "@nestjs/common";
import path from "path";
import root from "app-root-path";
import fs from "fs";
import { S3UploaderTypes } from "../../core/utils/enums";
import { cropProfileImage } from "../../core/utils/sharp.utils";
import { fromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";
import { CreateS3UploaderDto } from "./create-s3_uploader.dto";

@Injectable()
export class FileUploaderService {
  async uploadLiveStreamVideo(videoBuffer: Buffer, streamerId: string) {
    const key = `live-stream-recordings/${streamerId}/${uuidv4()}.mp4`;
    await this._putFile(videoBuffer, key, streamerId, true);

    return key;
  }

  async putImageCropped(imageBuffer: Buffer, myId: string) {
    let key = `${S3UploaderTypes.profileImage}-${uuidv4()}.jpg`;
    let image = await cropProfileImage(imageBuffer);
    await this._putFile(image, key, myId, true);
    return key;
  }

  async uploadChatMedia(dto: CreateS3UploaderDto) {
    let contentType = await fromBuffer(dto.mediaBuffer);
    let key = `${dto.myUser._id}/${S3UploaderTypes.media}-${uuidv4()}`;
    if (contentType) {
      key = `${key}.${contentType.ext}`;
    } else {
      key = `${key}.${dto.fileName.split(".")[1]}`;
    }
    await this._putFile(dto.mediaBuffer, key, dto.myUser._id);
    return key;
  }

  async uploadVerificationDoc(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    if (!file) {
      throw new Error("File is missing for verification document upload.");
    }
    const fileExtension = path.extname(file.originalname) || ".tmp"; // Get file extension
    const key = `verification-docs/${userId}/${S3UploaderTypes.media
      }-${uuidv4()}${fileExtension}`;
    await this._putFile(file.buffer, key, userId, false);
    return key;
  }

  async uploadAdImage(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    if (!file) {
      throw new Error("Ad image file is missing.");
    }
    const fileExtension = path.extname(file.originalname) || ".jpg"; // Store ads in a dedicated public folder so they can be served directly
    const key = `ads/${userId}-${uuidv4()}${fileExtension}`;
    await this._putFile(file.buffer, key, userId, true); // true for isPublic
    return key;
  }

  async uploadPdf(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    if (!file) throw new BadRequestException('Resume file is required');
    const fileExtension = path.extname(file.originalname) || ".pdf";
    const key = `ads/${userId}-${uuidv4()}${fileExtension}`;
    await this._putFile(file.buffer, key, userId, false);
    return key;
  }

  async _putFile(
    fileData: Buffer,
    key: string,
    userId: string,
    isPublic?: boolean
  ) {
    const fullFilePath = path.join(
      root.path,
      "public",
      isPublic ? "v-public" : "media",
      key
    );
    const directoryPath = path.dirname(fullFilePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    return new Promise<string>((resolve, reject) => {
      fs.writeFile(fullFilePath, fileData, (err) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(key);
      });
    });
  }
}
