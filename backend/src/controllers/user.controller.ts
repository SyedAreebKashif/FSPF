import { Request, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

// Validation Schemas
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().trim().email('Invalid email address format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    bio: z.string().trim().max(300).optional(),
    avatar: z.string().trim().url('Avatar must be a valid URL').optional().or(z.literal('')),
    password: z.string().min(6).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

export class UserController {
  /**
   * @route   POST /api/v1/users/register
   * @desc    Register a new user
   * @access  Public
   */
  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw ApiError.badRequest('Invalid registration data', errorMessages);
    }

    const { user, token } = await userService.register(parseResult.data);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  });

  /**
   * @route   POST /api/v1/users/login
   * @desc    Authenticate user and get token
   * @access  Public
   */
  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw ApiError.badRequest('Invalid login credentials', errorMessages);
    }

    const { user, token } = await userService.login(parseResult.data);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token,
      },
    });
  });

  /**
   * @route   GET /api/v1/users/me
   * @desc    Get currently logged-in user profile
   * @access  Private (Authenticated)
   */
  public getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?._id) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const user = await userService.getUserById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * @route   PUT /api/v1/users/me
   * @desc    Update current user profile
   * @access  Private (Authenticated)
   */
  public updateMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?._id) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw ApiError.badRequest('Invalid update payload', errorMessages);
    }

    const updatedUser = await userService.updateUserProfile(req.user._id, parseResult.data);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  });

  /**
   * @route   DELETE /api/v1/users/me
   * @desc    Delete current user account
   * @access  Private (Authenticated)
   */
  public deleteMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user?._id) {
      throw ApiError.unauthorized('User not authenticated');
    }

    await userService.deleteUser(req.user._id);

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  });

  /**
   * @route   GET /api/v1/users/:id
   * @desc    Get user profile by ID
   * @access  Private
   */
  public getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * @route   GET /api/v1/users
   * @desc    List all users (with pagination)
   * @access  Private (Admin or Authenticated)
   */
  public getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await userService.getUsers(page, limit);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });
}

export const userController = new UserController();
