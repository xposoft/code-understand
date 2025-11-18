"use client"

import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Table, Modal, Badge } from 'react-bootstrap';
import MainContentPage from '../../../components/MainContent/MainContentPage';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PurchaseJournalEntry = () => {
  const [journalData, setJournalData] = useState({
    voucherNumber: '',
    entryDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    entryType: 'purchase',
    narration: '',
    approvedBy: '',
    status: 'draft'
  });

  const [debitItems, setDebitItems] = useState([
    { id: 1, accountHead: '', amount: '', description: '' }
  ]);
  const [creditItems, setCreditItems] = useState([
    { id: 1, accountHead: '', amount: '', description: '' }
  ]);

  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);

  const accountHeads = [
    'Purchase Account',
    'Input GST',
    'Cash Account',
    'Bank Account',
    'Accounts Payable',
    'Inventory',
    'Expenses'
  ];

  // Calculate totals and check balance
  useEffect(() => {
    const debitTotal = debitItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const creditTotal = creditItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    setTotalDebit(debitTotal);
    setTotalCredit(creditTotal);
    setIsBalanced(Math.abs(debitTotal - creditTotal) < 0.01);
  }, [debitItems, creditItems]);

  const handleJournalChange = (e) => {
    const { name, value } = e.target;
    setJournalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDebitItemChange = (id, field, value) => {
    setDebitItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleCreditItemChange = (id, field, value) => {
    setCreditItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addDebitRow = () => {
    const newId = Math.max(...debitItems.map(item => item.id), 0) + 1;
    setDebitItems([...debitItems, { id: newId, accountHead: '', amount: '', description: '' }]);
  };

  const addCreditRow = () => {
    const newId = Math.max(...creditItems.map(item => item.id), 0) + 1;
    setCreditItems([...creditItems, { id: newId, accountHead: '', amount: '', description: '' }]);
  };

  const removeDebitRow = (id) => {
    if (debitItems.length > 1) {
      setDebitItems(debitItems.filter(item => item.id !== id));
    }
  };

  const removeCreditRow = (id) => {
    if (creditItems.length > 1) {
      setCreditItems(creditItems.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isBalanced) {
      toast.error('Journal entry must be balanced! Debit and Credit totals must match.');
      return;
    }
    toast.success('Journal entry saved successfully!');
    // Handle form submission
  };

  return (
    <MainContentPage>
      <div className="container-fluid px-4 py-3">
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Purchase Journal Entry</h4>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <a href="/home">Home</a>
            <span className="separator mx-2"></span>
            <div>Accounting</div>
            <span className="separator mx-2"></span>
            <div>Journal Entries</div>
            <span className="separator mx-2"></span>
            <span>Purchase Entry</span>
          </nav>
        </div>

        <Card className="shadow-sm mb-4">
          <Card.Header className="text-white py-3" style={{ backgroundColor: '#9C27B0' }}>
            <h5 className="mb-0">Journal Entry Details</h5>
          </Card.Header>
          <Card.Body style={{ backgroundColor: '#F3E5F5' }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Voucher Number *</Form.Label>
                    <Form.Control
                      type="text"
                      name="voucherNumber"
                      value={journalData.voucherNumber}
                      onChange={handleJournalChange}
                      required
                      placeholder="Auto-generated"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entry Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="entryDate"
                      value={journalData.entryDate}
                      onChange={handleJournalChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Reference Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="referenceNumber"
                      value={journalData.referenceNumber}
                      onChange={handleJournalChange}
                      placeholder="Purchase reference"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Entry Type *</Form.Label>
                    <Form.Select
                      name="entryType"
                      value={journalData.entryType}
                      onChange={handleJournalChange}
                      required
                    >
                      <option value="purchase">Purchase</option>
                      <option value="payment">Payment</option>
                      <option value="receipt">Receipt</option>
                      <option value="contra">Contra</option>
                      <option value="journal">General Journal</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={9}>
                  <Form.Group className="mb-3">
                    <Form.Label>Narration</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="narration"
                      value={journalData.narration}
                      onChange={handleJournalChange}
                      placeholder="Enter journal entry description..."
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <div>
                      <Badge bg={journalData.status === 'draft' ? 'warning' : 'success'} className="fs-6">
                        {journalData.status.toUpperCase()}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Debit and Credit Sections */}
              <Row>
                {/* Debit Section */}
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="text-white" style={{ backgroundColor: '#4CAF50' }}>
                      <h6 className="mb-0">Debit Entries</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <Table bordered size="sm">
                          <thead>
                            <tr>
                              <th>Account Head</th>
                              <th width="120">Amount (₹)</th>
                              <th width="80">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {debitItems.map((item, index) => (
                              <tr key={item.id}>
                                <td>
                                  <Form.Select
                                    value={item.accountHead}
                                    onChange={(e) => handleDebitItemChange(item.id, 'accountHead', e.target.value)}
                                    required
                                  >
                                    <option value="">Select Account</option>
                                    {accountHeads.map(head => (
                                      <option key={head} value={head}>{head}</option>
                                    ))}
                                  </Form.Select>
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => handleDebitItemChange(item.id, 'amount', e.target.value)}
                                    required
                                    placeholder="0.00"
                                  />
                                </td>
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeDebitRow(item.id)}
                                    disabled={debitItems.length === 1}
                                  >
                                    <i className="fas fa-times"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <Button variant="outline-success" size="sm" onClick={addDebitRow}>
                        <i className="fas fa-plus"></i> Add Debit Line
                      </Button>
                    </Card.Body>
                    <Card.Footer>
                      <strong>Total Debit: ₹{totalDebit.toFixed(2)}</strong>
                    </Card.Footer>
                  </Card>
                </Col>

                {/* Credit Section */}
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="text-white" style={{ backgroundColor: '#F44336' }}>
                      <h6 className="mb-0">Credit Entries</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <Table bordered size="sm">
                          <thead>
                            <tr>
                              <th>Account Head</th>
                              <th width="120">Amount (₹)</th>
                              <th width="80">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {creditItems.map((item, index) => (
                              <tr key={item.id}>
                                <td>
                                  <Form.Select
                                    value={item.accountHead}
                                    onChange={(e) => handleCreditItemChange(item.id, 'accountHead', e.target.value)}
                                    required
                                  >
                                    <option value="">Select Account</option>
                                    {accountHeads.map(head => (
                                      <option key={head} value={head}>{head}</option>
                                    ))}
                                  </Form.Select>
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => handleCreditItemChange(item.id, 'amount', e.target.value)}
                                    required
                                    placeholder="0.00"
                                  />
                                </td>
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeCreditRow(item.id)}
                                    disabled={creditItems.length === 1}
                                  >
                                    <i className="fas fa-times"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <Button variant="outline-success" size="sm" onClick={addCreditRow}>
                        <i className="fas fa-plus"></i> Add Credit Line
                      </Button>
                    </Card.Body>
                    <Card.Footer>
                      <strong>Total Credit: ₹{totalCredit.toFixed(2)}</strong>
                    </Card.Footer>
                  </Card>
                </Col>
              </Row>

              {/* Balance Check and Action Buttons */}
              <Row className="mt-4">
                <Col md={8}>
                  <Card>
                    <Card.Body className={`text-center ${isBalanced ? 'bg-light' : 'bg-danger text-white'}`}>
                      <h5 className="mb-0">
                        {isBalanced ? (
                          <>
                            <i className="fas fa-check-circle text-success me-2"></i>
                            Journal Entry is Balanced
                          </>
                        ) : (
                          <>
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Journal Entry is Not Balanced! 
                            (Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)})
                          </>
                        )}
                      </h5>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="success" 
                      type="submit"
                      disabled={!isBalanced}
                      size="lg"
                    >
                      <i className="fas fa-save me-2"></i>
                      Save Journal Entry
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

export default PurchaseJournalEntry;