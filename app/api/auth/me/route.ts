
// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import User from '@/models/User';
// import { verifyToken } from '@/lib/jwt';
// import { cookies } from 'next/headers';

// export async function GET(request: NextRequest) {
//   try {
//     const token = cookies().get('token')?.value;
    
//     if (!token) {
//       return NextResponse.json({ user: null }, { status: 200 });
//     }

//     const decoded = verifyToken(token);
//     await connectDB();
    
//     const user = await User.findById(decoded.userId).select('-password');
    
//     if (!user) {
//       cookies().delete('token');
//       return NextResponse.json({ user: null }, { status: 200 });
//     }

//     return NextResponse.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error('Auth check error:', error);
//     cookies().delete('token');
//     return NextResponse.json({ user: null }, { status: 200 });
//   }
// }
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = verifyToken(token);

    return NextResponse.json({
      user: {
        id: decoded.userId, // ✅ FIXED
        email: decoded.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
