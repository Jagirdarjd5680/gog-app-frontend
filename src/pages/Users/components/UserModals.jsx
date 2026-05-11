import React from 'react';
import UserFormModal from '../../../components/Users/UserForm/UserFormModal';
import UserDetailsModal from '../../../components/Users/UserDetails/UserDetailsModal';
import DeleteConfirmDialog from '../../../components/Common/DeleteConfirmDialog';
import RecycleBin from '../../../components/Common/RecycleBin';
import PaymentQuickModal from '../../../components/Users/Payment/PaymentQuickModal';

const UserModals = ({
    modalOpen, setModalOpen, selectedUser, fetchUsers,
    viewModalOpen, setViewModalOpen, viewUserId,
    deleteDialogOpen, setDeleteDialogOpen, confirmDelete, userToDelete,
    recycleBinOpen, setRecycleBinOpen, fetchBinCount,
    paymentModalOpen, setPaymentModalOpen, setSearchParams
}) => {
    const handleClose = (setter) => {
        setter(false);
        setSearchParams({});
    };

    return (
        <>
            <UserFormModal open={modalOpen} onClose={() => handleClose(setModalOpen)} user={selectedUser} onSuccess={fetchUsers} />
            <PaymentQuickModal open={paymentModalOpen} onClose={() => handleClose(setPaymentModalOpen)} user={selectedUser} onSuccess={fetchUsers} />
            <UserDetailsModal open={viewModalOpen} onClose={() => handleClose(setViewModalOpen)} userId={viewUserId} />
            <DeleteConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete} title="Delete User" message={`Are you sure you want to delete ${userToDelete?.name}?`} />
            <RecycleBin open={recycleBinOpen} onClose={() => setRecycleBinOpen(false)} type="user" onRestore={() => { fetchUsers(); fetchBinCount(); }} />
        </>
    );
};

export default UserModals;
