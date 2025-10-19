import { rm } from "fs/promises";
import Directory from '../models/directoryModel.js'
import File from '../models/fileModel.js'
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const getDirectory = async (req, res) => {
    const user = req.user;
    const _id = req.params.id || user.rootDirId;
    const directoryData = await Directory.findOne({ _id, userId: user._id }).lean();
    if (!directoryData) {
        return res
            .status(404)
            .json({ error: "Directory not found or you do not have access to it!" });
    }

    const files = await File.find({ parentDirId: directoryData._id }).lean();
    const directories = await Directory.find({ parentDirId: _id }).lean();
    return res.status(200).json({
        ...directoryData,
        files: files.map((dir) => ({ ...dir, id: dir._id })),
        directories: directories.map((dir) => ({ ...dir, id: dir._id })),
    });
}

export const createDirectory = async (req, res, next) => {
    const user = req.user;
    const parentDirId = req.params.parentDirId || user.rootDirId;
    const sanitizedDirname = purify.sanitize(req.headers.dirname);
    const dirname = sanitizedDirname || "New Folder";
    try {
        const parentDir = await Directory.findById(parentDirId);
        if (!parentDir)
            return res
                .status(404)
                .json({ message: "Parent Directory Does not exist!" });

        await Directory.insertOne({
            name: dirname,
            parentDirId,
            userId: user._id,
        });

        return res.status(201).json({ message: "Directory Created!" });
    } catch (err) {
        if (err.code === 121) {
            res.status(400).json({ error: "Invalid input, please enter valid details" });
        } else {
            next(err);
        }
    }
}

export const updateDirectory = async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    const { newDirName } = req.body;
    const sanitizedDirname = purify.sanitize(newDirName);
    try {
        await Directory.findOneAndUpdate(
            {
                _id: id,
                userId: user._id,
            },
            { name: sanitizedDirname }
        );
        res.status(200).json({ message: "Directory Renamed!" });
    } catch (err) {
        next(err);
    }
}

export const deleteDirectory = async (req, res, next) => {
    const { id } = req.params;
    const dirObjId = id;
    try {
        const directoryData = await Directory.findOne(
            {
                _id: dirObjId,
                userId: req.user._id,
            }
        ).select('_id');

        if (!directoryData) {
            return res.status(404).json({ error: "Directory not found!" });
        }

        async function getDirectoryContents(id) {
            let files = await File.find({ parentDirId: id }).select('extension').lean();
            let directories = await Directory.find({ parentDirId: id }).select('_id').lean();

            for (const { _id, name } of directories) {
                const { files: childFiles, directories: childDirectories } =
                    await getDirectoryContents(_id);

                files = [...files, ...childFiles];
                directories = [...directories, ...childDirectories];
            }

            return { files, directories };
        }

        const { files, directories } = await getDirectoryContents(dirObjId);

        for (const { _id, extension } of files) {
            await rm(`./storage/${_id.toString()}${extension}`);
        }

        await File.deleteMany({
            _id: { $in: files.map(({ _id }) => _id) },
        });

        await Directory.deleteMany({
            _id: { $in: [...directories.map(({ _id }) => _id), dirObjId] },
        });
    } catch (error) {
        next(error)
    }

    return res.json({ message: "Files deleted successfully" });
}