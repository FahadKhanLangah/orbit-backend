/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Document, Schema } from 'mongoose';

export enum GroupMessagingPolicy {
    AllMembers = "AllMembers",
    AdminsOnly = "AdminsOnly",
}

/* 
 
*/

export interface IGroupSettings extends Document {
    //roomId
    _id: string;
    // creator id
    cId: string;
    createdAt: Date;
    desc?: string;
    pinMsg?: {};
    extraData?: {};
    outUsers: string[];
    // group name
    gName: string;
    //group image
    gImg: string;
    // Messaging policy
    messagingPolicy: GroupMessagingPolicy;
    // A list of specific members who cannot send messages
    mutedMembers: string[];
}

export const GroupSettingSchema: Schema = new Schema(
    {
        cId: { type: Schema.Types.ObjectId, required: true },
        gName: { type: String, required: true },
        gImg: { type: String, required: true },
        outUsers: { type: [Schema.Types.ObjectId], default: [], select: false },
        pinMsg: { type: Object, default: null },
        extraData: { type: Object, default: null },
        desc: { type: String, default: null },
        createdAt: { type: Date, select: true },
        updatedAt: { type: Date, select: false },
        // Messaging policy
        messagingPolicy: {
            type: String,
            enum: Object.values(GroupMessagingPolicy),
            default: GroupMessagingPolicy.AllMembers,
        },
        mutedMembers: { // A list of specific members who cannot send messages
            type: [Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
    },
    {
        timestamps: true,

    },
);
