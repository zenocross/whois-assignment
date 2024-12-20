import React, { useState, useRef, useEffect } from "react";
import './App.css';

const InfoTable = ({ data, title }) => {
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div>
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <strong>{subValue}</strong>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value;
  };

  return (
    <div className="table-container">
      <h3>{title}</h3>
      <table className="table">
        <thead>
          <tr>
            {Object.keys(data).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.entries(data).map(([key, value]) => (
              <td
                key={key}
                className={key === "Hostnames" ? "hostnames-cell" : ""}
              >
                {renderValue(value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

function App() {
  const [inputValue, setInputValue] = useState("");
  const [searchType, setSearchType] = useState('domain');
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false); // New loading state

  const inputRef = useRef();

  const focusAndSelectInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  };

  useEffect(() => {
    focusAndSelectInput(); // Focus the input when the component loads
  }, [searchType]);

  const callBackendAPI = async (domainName, searchCategory) => {
    try {
      setLoading(true); // Set loading to true when starting the API call
      const response = await fetch(
        `http://localhost:5000/api/domain-lookup?domain=${domainName}&searchType=${searchCategory}`
      );
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
        setError(null);
      } else {
        setError(`Error: ${response.statusText}`);
      }
    } catch (err) {
      setError('Error: Error fetching data from server.');
      console.error(err);
    } finally{
      setLoading(false); // Set loading to false when the API call is done
    }
  };

  const handleSubmission = (event) => {
    event.preventDefault();
  };

  const handleClickedSubmit = () => {
    setApiData(null);
    const domainName = inputValue.trim();
    if (domainName === '') {
      setError('Error: Please enter a valid domain.');
      return;
    }
    callBackendAPI(domainName, searchType);
    focusAndSelectInput();
  };

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select(); // Automatically select text when input gains focus
    }
  };

  const handleSearchTypeChange = (e) => {
    setApiData(null);
    setSearchType(e.target.value);
  };

  return (
    <>
      {/* <div className="logo">       */}
      <div className={`logo ${isLoading ? 'animate' : ''}`}> {/* Add animate class on loading */}
        {/* <img src={internetLogo} className="internet logo" alt="Internet logo" /> */}
      </div>

      <h1>Domain Checker</h1>

      <div className="body">
        <form onSubmit={handleSubmission}>
          <input
            ref={inputRef}
            type="text"
            className="input-box"
            placeholder="Input domain name..."
            value={inputValue}
            onFocus={handleFocus}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />

          <button onClick={handleClickedSubmit} 
            className="submit-button"
            disabled={isLoading}>
            Submit
          </button>
        </form>

        <div>
          <h3>Search Type:</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="options"
                value="domain"
                checked={searchType === 'domain'}
                onChange={handleSearchTypeChange}
                disabled={isLoading}
              />
              Domain Information
            </label>

            <label>
              <input
                type="radio"
                name="options"
                value="contact"
                checked={searchType === 'contact'}
                onChange={handleSearchTypeChange}
                disabled={isLoading}
              />
              Contact Information
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {apiData && searchType === "domain" && (
          <InfoTable data={apiData} title="Domain Information" />
        )}

        {apiData && searchType === "contact" && (
          <InfoTable data={apiData} title="Contact Information" />
        )}
      </div>
    </>
  );
}

export default App;
