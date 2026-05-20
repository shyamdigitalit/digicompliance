import React from 'react'
import axiosInstance from '../../../config/axiosInstance';
import Loader from '../../../components/loader';
import { generateAbbreviation } from '../../../utilities/genAbbreviation';
import { AxiosError } from 'axios';
// import { DndContext, KeyboardSensor, PointerSensor, useDroppable, pointerWithin } from "@dnd-kit/core";
// import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";


const Privileges = () => {
    const [saved, setSaved] = React.useState(false);
    const [error, setError] = React.useState({ status: false, log: '' });
    const [loading, setLoading] = React.useState(false);

  return (
    <div className="profile-card privilege-card">
        <h3>Dynamic Privilege Management</h3>
        <p>Manage all user access controls dynamically.</p>

        {/* {loading ? <Loader /> : (
            <div className="privilege-tabs plnt-tabs">
                <button className="privilege-tab" onClick={() => { }}>Team Members</button>
                <button className="privilege-tab active" onClick={() => { }}>Roles</button>
            </div>
        )} */}
    </div>
  )
}

export default Privileges