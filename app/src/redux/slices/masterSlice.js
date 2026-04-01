import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

const initvl = {
    masters: null,
    loading: false,
    error: null,
}

export const fetchMasters = createAsyncThunk('fetchmasters', async (_, thunkAPI) => {
    try {
        const allMasters = {}
        const [
            comptypRes,
            compcategRes,
            compfreqRes,
            criticltyRes,
            penltyRes,
            deptRes,
            plntRes
        ] = await Promise.allSettled([
            axiosInstance.get(`/api/comptyp/fetch`),
            axiosInstance.get(`/api/compcateg/fetch`),
            axiosInstance.get(`/api/compfreq/fetch`),
            axiosInstance.get(`/api/criticlty/fetch`),
            axiosInstance.get(`/api/penlty/fetch`),
            axiosInstance.get(`/api/dept/fetch`),
            axiosInstance.get(`/api/plnt/fetch`),
        ])
        if (comptypRes.status === 'fulfilled') Object.assign(allMasters, { complianceType: comptypRes?.value?.data?.data || [] })
        if (compcategRes.status === 'fulfilled') Object.assign(allMasters, { complianceCategory: compcategRes?.value?.data?.data || [] })
        if (compfreqRes.status === 'fulfilled') Object.assign(allMasters, { complianceFrequency: compfreqRes?.value?.data?.data || [] })
        if (criticltyRes.status === 'fulfilled') Object.assign(allMasters, { criticality: criticltyRes?.value?.data?.data || [] })
        if (penltyRes.status === 'fulfilled') Object.assign(allMasters, { penalty: penltyRes?.value?.data?.data || [] })
        if (deptRes.status === 'fulfilled') Object.assign(allMasters, { department: deptRes?.value?.data?.data || [] })
        if (plntRes.status === 'fulfilled') Object.assign(allMasters, { plant: plntRes?.value?.data?.data || [] })

        return allMasters
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'All Master Data Fetch failed');
    }
})

const masterSlice = createSlice({
    name: 'master',
    initialState: initvl,
    reducers: {
        removeMasters: (state) => {
            state.loading = false
            state.error = null
            state.masters = null
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMasters.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchMasters.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.masters = action.payload
        })
        .addCase(fetchMasters.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.masters = null
        })
    }
})
export default masterSlice.reducer
export const { removeMasters } = masterSlice.actions;