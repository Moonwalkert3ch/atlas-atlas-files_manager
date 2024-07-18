import dbClient from "../utils/db";
import { ObjectId } from "mongodb";
import redisClient from "../utils/redis";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
// require('dotenv').config();



const FilesController = {
    async postUpload(req, res) {
        const token = req.headers['x-token'];

        // retrieve user based on token
        const userId = await redisClient.get(`auth_${token}`);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // create required fields
        const { name, type, parentId = '0', isPublic = false, data } = req.body;

        // format fields
        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: 'Missing type' });
        }

        if ((type === 'file' || type === 'image') && !data) {
            return res.status(400).json({ error: 'Missing data' });
        }

        // file data
        try {
            const filesCollection = dbClient.client.db().collection('files');
            console.log('Files collection:', filesCollection);

            // set parentId if exist
            if (parentId !== '0') {
                console.log('ParentId:', parentId); // Debugging output

                try {
                    // Convert parentId to ObjectId
                    const parentObjectId = new ObjectId(parentId);

                    const parentFile = await filesCollection.findOne({ _id: parentObjectId });

                    if (!parentFile) {
                        console.log('Parent not found');
                        return res.status(400).json({ error: 'Parent not found' });
                    }

                    if (parentFile.type !== 'folder') {
                        console.log('Parent is not a folder');
                        return res.status(400).json({ error: 'Parent is not a folder' });
                    }
                } catch (error) {
                    console.error('Error creating ObjectId:', error);
                    return res.status(400).json({ error: 'Invalid parentId format' });
                }
            }

            // Prepare file object to be uploaded
            const fileObject = {
                userId: new ObjectId(userId),
                name,
                type,
                parentId: new ObjectId(parentId),
                isPublic,
            };

            // If type is file or image, store the file locally
            if (type === 'file' || type === 'image') {
                // Determine storage folder path
                const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

                // Stores the file locally
                const fileName = `${uuidv4()}.bin`;
                const filePath = path.join(FOLDER_PATH, fileName);
                const fileBuffer = Buffer.from(data, 'base64');
                fs.writeFileSync(filePath, fileBuffer);

                console.log('File stored at:', filePath);

                // Adds localPath to fileObject
                fileObject.localPath = filePath;
            }

            // Insert fileObject into database
            const result = await filesCollection.insertOne(fileObject);
            console.log('Insert result:', result);

            // Return the newly created file with status 201
            const newFile = {
                id: result.insertedId,
                userId: fileObject.userId,
                name: fileObject.name,
                type: fileObject.type,
                parentId: fileObject.parentId,
                isPublic: fileObject.isPublic,
                localPath: fileObject.localPath, // Only present for file or image types
            };
            console.log('New file:', newFile);

            return res.status(201).json(newFile);
        } catch (error) {
            console.error('Error creating file:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = FilesController;

// comment to push 
