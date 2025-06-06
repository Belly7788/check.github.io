<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render('Profile/Profile', [
            'user' => [
                'username' => $user->username,
                'email' => $user->email,
                'image' => $user->image ? Storage::url($user->image) : null,
                'cover' => $user->cover ? Storage::url($user->cover) : null,
            ],
        ]);
    }

    public function updateProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image',
        ]);

        $user = Auth::user();
        $file = $request->file('profile_image');
        $timestamp = now()->format('Ymd_His');
        $randomString = Str::random(50 - strlen('uploads/profile_user/') - strlen($timestamp) - 1);
        $filename = "uploads/profile_user/{$timestamp}_{$randomString}.{$file->getClientOriginalExtension()}";

        // Delete old profile image if exists
        if ($user->image) {
            Storage::delete($user->image);
        }

        // Store new profile image
        $path = $file->storeAs('', $filename, 'public');
        $user->image = $path;
        $user->save();

        return redirect()->route('settings.profile')->with('success', 'Profile image updated successfully.');
    }

    public function updateCoverImage(Request $request)
    {
        $request->validate([
            'cover_image' => 'required|image',
        ]);

        $user = Auth::user();
        $file = $request->file('cover_image');
        $timestamp = now()->format('Ymd_His');
        $randomString = Str::random(50 - strlen('uploads/cover_user/') - strlen($timestamp) - 1);
        $filename = "uploads/cover_user/{$timestamp}_{$randomString}.{$file->getClientOriginalExtension()}";

        // Delete old cover image if exists
        if ($user->cover) {
            Storage::delete($user->cover);
        }

        // Store new cover image
        $path = $file->storeAs('', $filename, 'public');
        $user->cover = $path;
        $user->save();

        return redirect()->route('settings.profile')->with('success', 'Cover image updated successfully.');
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:tbluser,username,' . Auth::id(),
            'email' => 'required|email|max:255|unique:tbluser,email,' . Auth::id(),
        ]);

        $user = Auth::user();
        $user->username = $request->username;
        $user->email = $request->email;
        $user->save();

        return redirect()->route('settings.profile')->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Verify old password
        if (!Hash::check($request->old_password, $user->password)) {
            return redirect()->route('settings.profile')->withErrors(['old_password' => 'The old password is incorrect.']);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return redirect()->route('settings.profile')->with('success', 'Password updated successfully.');
    }

    public function checkUsername($username)
    {
        $user = Auth::user();
        $exists = User::where('username', $username)
                    ->where('id', '!=', $user->id)
                    ->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This username is already taken.' : 'Username is available.'
        ]);
    }
}
