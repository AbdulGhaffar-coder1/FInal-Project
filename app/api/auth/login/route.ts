// // import { NextRequest, NextResponse } from 'next/server';
// // import { connectDB } from '@/lib/db';
// // import User from '@/models/User';
// // import { generateToken } from '@/lib/jwt';
// // import { cookies } from 'next/headers';

// // export async function POST(request: NextRequest) {
// //   try {
// //     await connectDB();
// //     const { email, password } = await request.json();

// //     // Validation
// //     if (!email || !password) {
// //       return NextResponse.json(
// //         { message: 'Email and password are required' },
// //         { status: 400 }
// //       );
// //     }

// //     // Find user with password
// //     const user = await User.findOne({ email }).select('+password');
// //     if (!user) {
// //       return NextResponse.json(
// //         { message: 'Invalid credentials' },
// //         { status: 401 }
// //       );
// //     }

// //     // Check password
// //     const isValidPassword = await user.comparePassword(password);
// //     if (!isValidPassword) {
// //       return NextResponse.json(
// //         { message: 'Invalid credentials' },
// //         { status: 401 }
// //       );
// //     }

// //     // Generate JWT
// //     const token = generateToken({
// //       userId: user._id.toString(),
// //       email: user.email,
// //     });

// //     // Set httpOnly cookie
// //     cookies().set('token', token, {
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === 'production',
// //       sameSite: 'strict',
// //       maxAge: 60 * 60 * 24 * 7, // 7 days
// //       path: '/',
// //     });

// //     return NextResponse.json(
// //       {
// //         message: 'Login successful',
// //         user: {
// //           id: user._id,
// //           name: user.name,
// //           email: user.email,
// //         },
// //       },
// //       { status: 200 }
// //     );
// //   } catch (error: any) {
// //     console.error('Login error:', error);
// //     return NextResponse.json(
// //       { message: 'Internal server error' },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import User from '@/models/User';
// import { generateToken } from '@/lib/jwt';
// import { cookies } from 'next/headers';

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();
//     const { email, password } = await request.json();

//     // Validation
//     if (!email || !password) {
//       return NextResponse.json(
//         { message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     // Find user with password
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return NextResponse.json(
//         { message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Check password
//     const isValidPassword = await user.comparePassword(password);
//     if (!isValidPassword) {
//       return NextResponse.json(
//         { message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Generate JWT
//     const token = generateToken({
//       userId: user._id.toString(),
//       email: user.email,
//     });

//     // Set httpOnly cookie (for automatic browser storage)
//     cookies().set('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//       path: '/',
//     });

//     // ⭐⭐⭐ FIXED: Return token in JSON response too ⭐⭐⭐
//     return NextResponse.json(
//       {
//         message: 'Login successful',
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//         },
//         token: token, // ⭐⭐⭐ THIS WAS MISSING! ⭐⭐⭐
//       },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error('Login error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set httpOnly cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // ⭐⭐⭐ MUST RETURN TOKEN IN JSON ⭐⭐⭐
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token: token, // ⭐⭐⭐ CRITICAL: Frontend needs this ⭐⭐⭐
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}