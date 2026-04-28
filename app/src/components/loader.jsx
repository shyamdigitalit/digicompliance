import '../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-overlay" role="status" aria-label="Loading users">
      <div className="loader">
        <span className="loader__dot"></span>
        <span className="loader__dot"></span>
        <span className="loader__dot"></span>
      </div>
    </div>
  )
}

export default Loader