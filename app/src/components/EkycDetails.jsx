import React from 'react'
import axios from 'axios'

const uri = `https://staging.eko.in:25004/ekoapi/v3/tools/kyc/aadhaar/xml-download`
const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({is_consent: 'Y/N'})
}

const EkycDetails = () => {
    const fetchKycDetails = React.useCallback(async () => {
        try {
            const response = await axios.post(uri, options)
            console.log(response)
        } catch (error) {
            console.error(error)
        }
    }, [])
    React.useEffect(() => {
        fetchKycDetails()
    }, [fetchKycDetails])

  return (
    <>
        <div className="wrap-section"></div>
    </>
  )
}

export default EkycDetails