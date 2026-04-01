const approvalIconCircle = (bgColor) => ({
    backgroundColor: bgColor,
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    marginRight: '8px'
});
  
const ApprovalStatusChip = (bgColor) => ({
    backgroundColor: bgColor,
    color: 'white',
    fontWeight: 'bold',
    padding: '1px 8px',
    borderRadius: '8px',
    display: 'inline-block',
    textAlign: 'center',
    fontSize: '0.8rem',
    minWidth: '60px',
    height: '24px', 
    lineHeight: '24px', // Center text vertically
});
  
export const ApprovalHistory = ({status, color, arr}) => {
    
    return (
      <div style={{width: "250px"}}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '8px' }}>
          Tracking Status
        </div>
  
        {
          arr && arr.length > 0 ? arr.map((item, index) => {
            let currentColor = item.approvalOption === "Approval" ? "#81bc97" : item.approvalOption === "Rejection" ? "#df8b92" : "#ccc";
            let icon = item.approvalOption === "Approval" ? "✔" : item.approvalOption === "Rejection" ? "X" : "?";
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <span style={approvalIconCircle(currentColor)}>{icon}</span>
                <span> {item.approvalOption} at L{item.approvalLevel} - {item.approvalDate} : {item.approvalTime}</span>
              </div>
            )
          }) :
          <div style={{ fontStyle: 'italic', color: '#888' }}>
            No approval history available.
          </div>
        }
  
        {/* Status Chip */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <span style={ApprovalStatusChip(color)}>{status}</span>
        </div>
      </div>
    );
};