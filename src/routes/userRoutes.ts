import { Router } from "express";
import upload from "../middleware/upload";
import { getUserById, getUsers, login, register, updateUser } from "../controller/userController";

const router = Router();

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', upload.single('avatar'), updateUser);

export default router;