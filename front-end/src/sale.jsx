import React, { useState, useEffect } from 'react';
import './SalesTracker.css';
import { readStock } from './stock';

function Sale() {
  const [productType, setProductType] = useState('');
  const [amountSold, setAmountSold] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [salesData, setSalesData] = useState({}); // Changed to object
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  // Fetch sales data on component mount
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5000/api/sales");
        //check sales data response
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }

        const data = await response.json();

        setSalesData(data);
        setRestork(dataStock)
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  // Function to handle form submission
  const submitData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    //check fro empty fields
    if(!productType || !amountSold || !wholesalePrice || !retailPrice){
      setError("Please fill All Fields");
      setIsLoading(false);
      return;
    }
    
    try {
      //calculate profit
      const profit = (Number(retailPrice) - Number(wholesalePrice)) * Number(amountSold);
      
      const response = await fetch("http://127.0.0.1:5000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productType,
          amountSold: Number(amountSold),
          wholesalePrice: Number(wholesalePrice),
          retailPrice: Number(retailPrice)

        })
      });

      //await for response
     // const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add sale');
      }
  
      // Update local state with the new sale
      setSalesData(prev => {
        const updated = { ...prev };
        if (!updated[productType]) updated[productType] = [];
        updated[productType].push({
          id: Date.now(),
          productType,
          amountSold: Number(amountSold),
          wholesalePrice: Number(wholesalePrice),
          retailPrice: Number(retailPrice),
          profit: Number(profit.toFixed(2))
        });
        return updated;
      });
      
      // Reset form
      setProductType('');
      setAmountSold('');
      setWholesalePrice('');
      setRetailPrice('');
      


      alert("SALES ADDED SUCCESSFULLY!");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //restork sales
  async function restorkSales() {
    
  }

  // Get all unique product types
  const productTypes = Object.keys(salesData);

  // Get sales for selected type or all sales
  const getDisplayedSales = () => {
    if (selectedType) {
      return salesData[selectedType] || [];
    }
    
    // Combine all sales from all product types
    return productTypes.reduce((acc, type) => {
      return [...acc, ...(salesData[type] || [])];
    }, []);
  };

  const displayedSales = getDisplayedSales();

  return (
    <div className="sales-tracker">
      <div className="sales-container">
        {/* Left Side - Input Form */}
        <div className="sales-form">
          <h2>Add Sale</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Product Type"
            value={productType}
            onChange={e => setProductType(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Amount Sold"
            value={amountSold}
            onChange={e => setAmountSold(e.target.value)}
            min="1"
            required
          />
          <input
            type="number"
            placeholder="Wholesale Price (per item)"
            value={wholesalePrice}
            onChange={e => setWholesalePrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
          <input
            type="number"
            placeholder="Retail Price (per item)"
            value={retailPrice}
            onChange={e => setRetailPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
          <button
            onClick={submitData}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Add Sale'}
          </button>

          {/* Product Type Filter */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Filter by Product Type</h3>
            <div className="type-buttons">
              <button
                onClick={() => setSelectedType('')}
                className={`type-btn ${!selectedType ? 'active' : ''}`}
              >
                All Types
              </button>
              {productTypes.map((type, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedType(type)}
                  className={`type-btn ${selectedType === type ? 'active' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Display Sales */}
        <div className="sales-display">
          <h2>Sales {selectedType && `for ${selectedType}`}</h2>
          {isLoading ? (
            <div className="loading-state">Loading sales data...</div>
          ) : displayedSales.length === 0 ? (
            <div className="empty-state">No sales data available</div>
          ) : (
            <ul className="sales-list">
              {displayedSales.map((sale) => (
                <li key={sale.id} className="sales-item">
                  <div className="sales-info">
                    <div>Type: {sale.productType}</div>
                    <div>Amount: {sale.amountSold}</div>
                    <div>Wholesale: ${sale.wholesalePrice.toFixed(2)}</div>
                    <div>Retail: ${sale.retailPrice.toFixed(2)}</div>
                    <div>Profit: ${sale.profit.toFixed(2)}</div>
                  </div>
                  <div className="sales-actions">
                    <button
                      onClick={() => {
                        setProductType(sale.productType);
                        setAmountSold(sale.amountSold);
                        setWholesalePrice(sale.wholesalePrice);
                        setRetailPrice(sale.retailPrice);
                      }}
                      className="btn-edit"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Are you sure you want to delete this sale?")) return;
                        try {
                          const response = await fetch(`http://127.0.0.1:5000/api/sales/${sale.id}`, {
                            method: "DELETE"
                          });
                          if (!response.ok) throw new Error('Delete failed');
                          const updatedResponse = await fetch("http://127.0.0.1:5000/api/sales");
                          const updatedData = await updatedResponse.json();
                          setSalesData(updatedData);
                        } catch (err) {
                          setError(err.message);
                        }
                      }}
                      className="btn-delete"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sale;