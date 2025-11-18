"use client"

import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Table, Modal, Badge, ListGroup } from 'react-bootstrap';
import MainContentPage from '../../../components/MainContent/MainContentPage';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SupplierPayment = () => {
  const [paymentData, setPaymentData] = useState({
    paymentVoucherNo: '',
    paymentDate: new Date().toISOString().split('T')[0],
    supplierCode: '',
    supplierName: '',
    paymentAmount: '',
    paymentMode: 'online',
    referenceNumber: '',
    bankAccount: '',
    chequeDate: '',
    paymentStatus: 'pending',
    remarks: ''
  });

  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Sample data
  const sampleSuppliers = [
    { id: 1, supplierCode: 'SUPP-001', supplierName: 'Book Distributors Ltd', contact: '9876543210' },
    { id: 2, supplierCode: 'SUPP-002', supplierName: 'Stationery World', contact: '8765432109' }
  ];

  const sampleInvoices = [
    { id: 1, invoiceNo: 'INV-001', invoiceDate: '2024-01-15', dueDate: '2024-02-15', amount: 50000, paidAmount: 0, balance: 50000 },
    { id: 2, invoiceNo: 'INV-002', invoiceDate: '2024-01-20', dueDate: '2024-02-20', amount: 75000, paidAmount: 25000, balance: 50000 },
    { id: 3, invoiceNo: 'INV-003', invoiceDate: '2024-02-01', dueDate: '2024-03-01', amount: 30000, paidAmount: 0, balance: 30000 }
  ];

  useEffect(() => {
    setSuppliers(sampleSuppliers);
    setOutstandingInvoices(sampleInvoices);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'supplierCode' || name === 'supplierName') {
      setShowSupplierDropdown(true);
    }
  };

  const handleSupplierSelect = (supplier) => {
    setPaymentData(prev => ({
      ...prev,
      supplierCode: supplier.supplierCode,
      supplierName: supplier.supplierName
    }));
    setShowSupplierDropdown(false);
    
    // Filter outstanding invoices for selected supplier
    const supplierInvoices = sampleInvoices.filter(inv => 
      inv.id <= 3 // Simulating supplier-specific invoices
    );
    setOutstandingInvoices(supplierInvoices);
  };

  const handleInvoiceSelect = (invoiceId, isSelected) => {
    if (isSelected) {
      const invoice = outstandingInvoices.find(inv => inv.id === invoiceId);
      setSelectedInvoices(prev => [...prev, invoice]);
    } else {
      setSelectedInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    }
  };

  const calculateTotalSelected = () => {
    return selectedInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedInvoices.length === 0) {
      toast.error('Please select at least one invoice for payment.');
      return;
    }
    toast.success('Payment processed successfully!');
    // Handle payment submission
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      completed: 'success',
      failed: 'danger',
      cancelled: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <MainContentPage>
      <div className="container-fluid px-4 py-3">
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Supplier Payment</h4>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <a href="/home">Home</a>
            <span className="separator mx-2"></span>
            <div>Accounting</div>
            <span className="separator mx-2"></span>
            <div>Payments</div>
            <span className="separator mx-2"></span>
            <span>Supplier Payment</span>
          </nav>
        </div>

        <Card className="shadow-sm mb-4">
          <Card.Header className="text-white py-3" style={{ backgroundColor: '#2196F3' }}>
            <h5 className="mb-0">Payment Details</h5>
          </Card.Header>
          <Card.Body style={{ backgroundColor: '#E3F2FD' }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Voucher No *</Form.Label>
                    <Form.Control
                      type="text"
                      name="paymentVoucherNo"
                      value={paymentData.paymentVoucherNo}
                      onChange={handleInputChange}
                      required
                      placeholder="PV-001"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="paymentDate"
                      value={paymentData.paymentDate}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Mode *</Form.Label>
                    <Form.Select
                      name="paymentMode"
                      value={paymentData.paymentMode}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="online">Online Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                      <option value="dd">Demand Draft</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Status</Form.Label>
                    <div>
                      <Badge bg={getPaymentStatusBadge(paymentData.paymentStatus)}>
                        {paymentData.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>Supplier Code *</Form.Label>
                    <Form.Control
                      type="text"
                      name="supplierCode"
                      value={paymentData.supplierCode}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter supplier code"
                    />
                    {showSupplierDropdown && (
                      <div className="position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                        <ListGroup>
                          {suppliers.map(supplier => (
                            <ListGroup.Item
                              key={supplier.id}
                              action
                              onClick={() => handleSupplierSelect(supplier)}
                              style={{ cursor: 'pointer' }}
                            >
                              <strong>{supplier.supplierCode}</strong> - {supplier.supplierName}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Supplier Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="supplierName"
                      value={paymentData.supplierName}
                      onChange={handleInputChange}
                      required
                      placeholder="Supplier name"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Amount (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="paymentAmount"
                      value={paymentData.paymentAmount}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {paymentData.paymentMode === 'cheque' && (
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cheque Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="chequeDate"
                        value={paymentData.chequeDate}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="referenceNumber"
                        value={paymentData.referenceNumber}
                        onChange={handleInputChange}
                        placeholder="Cheque number"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {paymentData.paymentMode === 'online' && (
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bank Account *</Form.Label>
                      <Form.Select
                        name="bankAccount"
                        value={paymentData.bankAccount}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Bank Account</option>
                        <option value="hdfc-001">HDFC Bank - XXXX1234</option>
                        <option value="sbi-001">SBI - XXXX5678</option>
                        <option value="icici-001">ICICI Bank - XXXX9012</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="referenceNumber"
                        value={paymentData.referenceNumber}
                        onChange={handleInputChange}
                        placeholder="UTR/Transaction ID"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Outstanding Invoices */}
              {paymentData.supplierCode && (
                <Card className="mb-4">
                  <Card.Header style={{ backgroundColor: '#FFC107' }}>
                    <h6 className="mb-0">Outstanding Invoices</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table bordered hover>
                        <thead>
                          <tr>
                            <th width="50">Select</th>
                            <th>Invoice No</th>
                            <th>Invoice Date</th>
                            <th>Due Date</th>
                            <th>Total Amount</th>
                            <th>Paid Amount</th>
                            <th>Balance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outstandingInvoices.map(invoice => (
                            <tr key={invoice.id}>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  onChange={(e) => handleInvoiceSelect(invoice.id, e.target.checked)}
                                />
                              </td>
                              <td>
                                <strong>{invoice.invoiceNo}</strong>
                              </td>
                              <td>{invoice.invoiceDate}</td>
                              <td>
                                <span className={isOverdue(invoice.dueDate) ? 'text-danger fw-bold' : ''}>
                                  {invoice.dueDate}
                                  {isOverdue(invoice.dueDate) && ' (Overdue)'}
                                </span>
                              </td>
                              <td>₹{invoice.amount.toLocaleString()}</td>
                              <td>₹{invoice.paidAmount.toLocaleString()}</td>
                              <td>
                                <strong>₹{invoice.balance.toLocaleString()}</strong>
                              </td>
                              <td>
                                {invoice.balance === 0 ? (
                                  <Badge bg="success">Paid</Badge>
                                ) : isOverdue(invoice.dueDate) ? (
                                  <Badge bg="danger">Overdue</Badge>
                                ) : (
                                  <Badge bg="warning">Pending</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Selected Invoices Summary */}
              {selectedInvoices.length > 0 && (
                <Card className="mb-4">
                  <Card.Header style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                    <h6 className="mb-0">Selected Invoices Summary</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <ListGroup>
                          {selectedInvoices.map(invoice => (
                            <ListGroup.Item key={invoice.id} className="d-flex justify-content-between">
                              <span>{invoice.invoiceNo} - Due: {invoice.dueDate}</span>
                              <strong>₹{invoice.balance.toLocaleString()}</strong>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Col>
                      <Col md={4}>
                        <Card className="bg-light">
                          <Card.Body className="text-center">
                            <h5>Total Selected</h5>
                            <h3 className="text-success">₹{calculateTotalSelected().toLocaleString()}</h3>
                            <small className="text-muted">
                              {selectedInvoices.length} invoice(s) selected
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Remarks and Actions */}
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Remarks</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="remarks"
                      value={paymentData.remarks}
                      onChange={handleInputChange}
                      placeholder="Additional payment remarks..."
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <div className="d-grid gap-2">
                    <Button variant="success" type="submit" size="lg">
                      <i className="fas fa-check-circle me-2"></i>
                      Process Payment
                    </Button>
                    <Button variant="outline-secondary">
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </Button>
                  </div>
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

export default SupplierPayment;