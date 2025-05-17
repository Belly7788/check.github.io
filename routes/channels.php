<?php

use App\Models\PoDetail;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('po-detail.{id}', function ($user, $id) {
    // Authorize the user to listen to the channel
    return $user && PoDetail::find($id) ? true : false;
});
