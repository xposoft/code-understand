"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Card, Table, Modal, ListGroup, Badge } from 'react-bootstrap';
import MainContentPage from '../../../components/MainContent/MainContentPage';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookDistribution = () => {
  const [distributionData, setDistributionData] = useState({
    distributionNo: '',
    distributionDate: new Date().toISOString().split('T')[0],
    recipientType: 'student',
    recipientCode: '',
    recipientName: '',
    classStandard: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    distributionType: 'sale',
    receiptNumber: '',
    authorizedBy: '',
    contactNumber: '',
    address: ''
  });

  const [tableItems, setTableItems] = useState([
    { id: 1, bookCode: '', bookName: '', category: '', standard: '', quantity: '', unitPrice: '', totalAmount: '' }
  ]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [books, setBooks] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [activeBookField, setActiveBookField] = useState(null);

  // Handle distribution data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDistributionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle table item changes
  const handleTableItemChange = (id, field, value) => {
    const updatedItems = tableItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate total amount if quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          const quantity = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
          const unitPrice = parseFloat(field === 'unitPrice' ? value : item.unitPrice) || 0;
          updatedItem.totalAmount = (quantity * unitPrice).toFixed(2);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setTableItems(updatedItems);
  };

  // Calculate total amount
  useEffect(() => {
    const total = tableItems.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
    setTotalAmount(total);
  }, [tableItems]);

  // Add new row
  const handleAddRow = () => {
    const newId = tableItems.length > 0 ? Math.max(...tableItems.map(item => item.id)) + 1 : 1;
    setTableItems([...tableItems, { 
      id: newId, 
      bookCode: '', 
      bookName: '', 
      category: '', 
      standard: '', 
      quantity: '', 
      unitPrice: '', 
      totalAmount: '' 
    }]);
  };

  // Delete row
  const handleDeleteRow = (id) => {
    if (tableItems.length === 1) {
      setTableItems([{ 
        id: 1, 
        bookCode: '', 
        bookName: '', 
        category: '', 
        standard: '', 
        quantity: '', 
        unitPrice: '', 
        totalAmount: '' 
      }]);
      return;
    }
    setTableItems(tableItems.filter(item => item.id !== id));
  };

  // Book selection
  const handleBookSelect = (book) => {
    if (!activeBookField) return;
    
    const updatedItems = tableItems.map(item => {
      if (item.id === activeBookField) {
        return {
          ...item,
          bookCode: book.bookCode,
          bookName: book.bookName,
          category: book.category,
          unitPrice: book.unitPrice || '0'
        };
      }
      return item;
    });
    
    setTableItems(updatedItems);
    setShowBookDropdown(false);
    setActiveBookField(null);
  };

  return (
    <MainContentPage>
      <div className="container-fluid px-4 py-3">
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Book Distribution</h4>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <a href="/home">Home</a>
            <span className="separator mx-2"></span>
            <div>Transaction</div>
            <span className="separator mx-2"></span>
            <div>Store Management</div>
            <span className="separator mx-2"></span>
            <span>Book Distribution</span>
          </nav>
        </div>

        <Card className="shadow-sm mb-4">
          <Card.Header className="text-white py-3" style={{ backgroundColor: '#2E7D32' }}>
            <h5 className="mb-0">Distribution Entry</h5>
          </Card.Header>
          <Card.Body style={{ backgroundColor: '#E8F5E8' }}>
            <Form>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>Distribution No</Form.Label>
                    <Form.Control type="text" value="DIST-001" disabled />
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Distribution Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="distributionDate"
                      value={distributionData.distributionDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>Recipient Type</Form.Label>
                    <Form.Select 
                      name="recipientType"
                      value={distributionData.recipientType}
                      onChange={handleInputChange}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="school">School</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Recipient Code/ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="recipientCode"
                      value={distributionData.recipientCode}
                      onChange={handleInputChange}
                      placeholder="Enter recipient code"
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>Recipient Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="recipientName"
                      value={distributionData.recipientName}
                      onChange={handleInputChange}
                      placeholder="Enter recipient name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Class/Standard</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="classStandard"
                      value={distributionData.classStandard}
                      onChange={handleInputChange}
                      placeholder="Enter class/standard"
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-2">
                    <Form.Label>Academic Year</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="academicYear"
                      value={distributionData.academicYear}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Distribution Type</Form.Label>
                    <Form.Select 
                      name="distributionType"
                      value={distributionData.distributionType}
                      onChange={handleInputChange}
                    >
                      <option value="sale">Sale</option>
                      <option value="free">Free Distribution</option>
                      <option value="replacement">Replacement</option>
                      <option value="sample">Sample</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Distribution Items Table */}
              <div className="table-responsive mb-3">
                <Table bordered hover>
                  <thead style={{ backgroundColor: '#7B1FA2', color: 'white' }}>
                    <tr>
                      <th>S.N</th>
                      <th>Book Code</th>
                      <th>Book Name</th>
                      <th>Category</th>
                      <th>Standard</th>
                      <th>Quantity</th>
                      <th>Unit Price (₹)</th>
                      <th>Total Amount (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableItems.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.bookCode}
                            onChange={(e) => handleTableItemChange(item.id, 'bookCode', e.target.value)}
                            placeholder="Book code"
                          />
                        </td>
                        <td style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.bookName}
                            onChange={(e) => handleTableItemChange(item.id, 'bookName', e.target.value)}
                            onClick={() => {
                              setActiveBookField(item.id);
                              setShowBookDropdown(true);
                            }}
                            placeholder="Search book name"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.category}
                            onChange={(e) => handleTableItemChange(item.id, 'category', e.target.value)}
                            placeholder="Category"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.standard}
                            onChange={(e) => handleTableItemChange(item.id, 'standard', e.target.value)}
                            placeholder="Standard"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={item.quantity}
                            onChange={(e) => handleTableItemChange(item.id, 'quantity', e.target.value)}
                            placeholder="Qty"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={item.unitPrice}
                            onChange={(e) => handleTableItemChange(item.id, 'unitPrice', e.target.value)}
                            placeholder="Price"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={item.totalAmount}
                            readOnly
                            className="fw-bold"
                          />
                        </td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteRow(item.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="9" className="text-center">
                        <Button variant="outline-primary" size="sm" onClick={handleAddRow}>
                          <i className="fas fa-plus"></i> Add Book
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {/* Action Buttons and Summary */}
              <Row>
                <Col md={8}>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button variant="success">
                      <i className="fas fa-save"></i> Save Distribution
                    </Button>
                    <Button variant="primary">
                      <i className="fas fa-eye"></i> View Records
                    </Button>
                    <Button variant="warning">
                      <i className="fas fa-print"></i> Print Receipt
                    </Button>
                    <Button variant="info">
                      <i className="fas fa-sync"></i> Reset
                    </Button>
                    <Button variant="secondary">
                      <i className="fas fa-times"></i> Cancel
                    </Button>
                  </div>
                </Col>
                <Col md={4}>
                  <Card>
                    <Card.Body>
                      <h6 className="card-title">Distribution Summary</h6>
                      <div className="mb-3">
                        <strong>Total Items: </strong>
                        <Badge bg="primary">{tableItems.filter(item => item.bookName).length}</Badge>
                      </div>
                      <div className="mb-3">
                        <strong>Total Quantity: </strong>
                        <Badge bg="info">
                          {tableItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
                        </Badge>
                      </div>
                      <div className="border-top pt-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>Total Amount:</strong>
                          <strong className="text-success">₹{totalAmount.toFixed(2)}</strong>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </div>
      <ToastContainer />
    </MainContentPage>
  );
};

export default BookDistribution;