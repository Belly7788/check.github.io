<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CompilePermission;
use Illuminate\Support\Facades\Auth;

class PermissionController extends Controller
{
    public function checkPermission(Request $request)
    {
        $userId = Auth::id(); // Get the authenticated user's ID
        $checkPermissionId = $request->input('check_permission_id'); // Get check_permission_id from request

        // Check if the user has the specified permission
        $hasPermission = $this->checkPermissionAndSubPermission($userId, $checkPermissionId);

        return response()->json([
            'hasPermission' => $hasPermission
        ]);
    }

    protected function checkPermissionAndSubPermission($userId, $checkPermissionId)
    {
        // Get the user's role_id from tbluser
        $user = User::find($userId);

        if (!$user) {
            return false; // User not found
        }

        $roleId = $user->role_id;

        // Check the compile_permission table for the role_id and check_permission_id
        $permission = CompilePermission::where('role_id', $roleId)
                                       ->where('check_permission_id', $checkPermissionId)
                                       ->exists();

        return $permission; // Return true if permission exists, false otherwise
    }
}
