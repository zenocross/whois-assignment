import { processDateField, processDomainAgeField, truncateString } from './utils.js';
import fetch from 'node-fetch'; // Import node-fetch for making external API requests
import dotenv from 'dotenv';

export const handleDomainLookup = async (req, res) => {
  const urlParams = new URL(req.url, `http://${req.headers.host}`);
  const domainName = urlParams.searchParams.get('domain'); // Get the domain parameter from the query string
  const searchType = urlParams.searchParams.get('searchType')?.toLowerCase();

  if (!domainName) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Domain name is required.' }));
    return;
  }

  if(!searchType){
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Search type is required.'}));
    return;
  }

  try {
    dotenv.config(); // Load environment variables
    const apiKey = process.env.WHOIS_API_KEY_2; // Use environment variable for the API key    
    const externalApiUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domainName}&outputFormat=JSON`;

    const apiResponse = await fetch(externalApiUrl);

    if (!apiResponse.ok) {
      throw new Error('Failed to fetch data from external API');
    }

    const apiData = await apiResponse.json();

    const hostNames = (apiData.WhoisRecord?.nameServers?.hostNames || []).map((hostname) =>
      truncateString(hostname, 25)
    );

    // Process the data based on the `searchType`
    let filteredData;

    // Process date fields
    const createdDate = processDateField(apiData.WhoisRecord?.createdDate)
    const expiryDate = processDateField(apiData.WhoisRecord?.expiresDate)

    // Process domain age
    const domainAge = processDomainAgeField(apiData.WhoisRecord?.estimatedDomainAge);

    if (searchType === 'domain') {
      filteredData = {
        'Domain Name': apiData.WhoisRecord?.domainName,
        'Registrar': apiData.WhoisRecord?.registrarName,
        'Registration Date': createdDate,
        'Expiration Date': expiryDate,
        'Estimated Domain Age': domainAge,
        'Hostnames':hostNames,
      };
    } else if (searchType === 'contact') {
      filteredData = {
        'Registrant Name': apiData.WhoisRecord?.registrant.name,
        'Technical Contact Name': apiData.WhoisRecord?.technicalContact.name,
        'Administrative Contact Name': apiData.WhoisRecord?.administrativeContact.name,
        'Contact Email': apiData.WhoisRecord?.contactEmail,
      };

    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid search type provided.' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filteredData)); // Return the external API response to the frontend
  } catch (error) {
    console.error('Error fetching data from external API:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error.' }));
  }
};
