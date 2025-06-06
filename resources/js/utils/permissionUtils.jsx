import axios from 'axios';

const checkPermission = (permissionId, callback) => {
    axios.post('/check-permission', { check_permission_id: permissionId })
        .then(response => {
            callback(response.data.hasPermission);
        })
        .catch(error => {
            console.error('Permission check failed:', error);
            callback(false); // Default to no permission on error
        });
};

export { checkPermission };
