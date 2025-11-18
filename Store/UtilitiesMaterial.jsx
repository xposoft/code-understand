"use client"

import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Table, Modal, Badge } from 'react-bootstrap';
import MainContentPage from '../../../components/MainContent/MainContentPage';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UtilitiesMaterial = () => {
  const [utilities, setUtilities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUtility, setEditingUtility] = useState(null);
  const [formData, setFormData] = useState({
    utilityCode: '',
    itemDescription: '',
    category: 'cleaning',
    quantity: '',
    unitOfMeasure: '',
    unitPrice: '',
    storageLocation: '',
    maintenanceSchedule: 'monthly',
    lastMaintenanceDate: '',
    conditionStatus: 'new',
    minimumStockLevel: '',
    currentStock: ''
  });

  const [filter, setFilter] = useState({
    category: '',
    condition: '',
    location: ''
  });

  // Sample data
  const sampleUtilities = [
    {
      id: 1,
      utilityCode: 'UTIL-001',
      itemDescription: 'Office Chair',
      category: 'furniture',
      quantity: 25,
      unitOfMeasure: 'Piece',
      unitPrice: 2500,
      storageLocation: 'Store Room A',
      maintenanceSchedule: 'quarterly',
      lastMaintenanceDate: '2024-01-15',
      conditionStatus: 'good',
      minimumStockLevel: 5,
      currentStock: 25
    },
    {
      id: 2,
      utilityCode: 'UTIL-002',
      itemDescription: 'Cleaning Solution',
      category: 'cleaning',
      quantity: 50,
      unitOfMeasure: 'Liter',
      unitPrice: 150,
      storageLocation: 'Store Room B',
      maintenanceSchedule: 'monthly',
      lastMaintenanceDate: '2024-02-01',
      conditionStatus: 'new',
      minimumStockLevel: 10,
      currentStock: 45
    }
  ];

  useEffect(() => {
    setUtilities(sampleUtilities);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUtility) {
      // Update existing utility
      setUtilities(utilities.map(util => 
        util.id === editingUtility.id ? { ...formData, id: editingUtility.id } : util
      ));
      toast.success('Utility item updated successfully!');
    } else {
      // Add new utility
      const newUtility = {
        ...formData,
        id: utilities.length + 1,
        utilityCode: `UTIL-${String(utilities.length + 1).padStart(3, '0')}`
      };
      setUtilities([...utilities, newUtility]);
      toast.success('Utility item added successfully!');
    }
    handleCloseModal();
  };

  const handleEdit = (utility) => {
    setEditingUtility(utility);
    setFormData(utility);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setUtilities(utilities.filter(util => util.id !== id));
    toast.success('Utility item deleted successfully!');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUtility(null);
    setFormData({
      utilityCode: '',
      itemDescription: '',
      category: 'cleaning',
      quantity: '',
      unitOfMeasure: '',
      unitPrice: '',
      storageLocation: '',
      maintenanceSchedule: 'monthly',
      lastMaintenanceDate: '',
      conditionStatus: 'new',
      minimumStockLevel: '',
      currentStock: ''
    });
  };

  const getConditionBadge = (condition) => {
    const variants = {
      new: 'success',
      good: 'primary',
      'needs repair': 'warning',
      damaged: 'danger'
    };
    return variants[condition] || 'secondary';
  };

  const getCategoryBadge = (category) => {
    const variants = {
      cleaning: 'info',
      office: 'primary',
      furniture: 'success',
      electronic: 'warning',
      other: 'secondary'
    };
    return variants[category] || 'secondary';
  };

  const filteredUtilities = utilities.filter(utility => {
    return (
      (filter.category === '' || utility.category === filter.category) &&
      (filter.condition === '' || utility.conditionStatus === filter.condition) &&
      (filter.location === '' || utility.storageLocation.includes(filter.location))
    );
  });

  return (
    <MainContentPage>
      <div className="container-fluid px-4 py-3">
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Utilities Material Management</h4>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <a href="/home">Home</a>
            <span className="separator mx-2"></span>
            <div>Store Management</div>
            <span className="separator mx-2"></span>
            <span>Utilities Material</span>
          </nav>
        </div>

        {/* Filters Card */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="text-white py-3" style={{ backgroundColor: '#FF9800' }}>
            <h5 className="mb-0">Filter Utilities</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={filter.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="office">Office Supplies</option>
                    <option value="furniture">Furniture</option>
                    <option value="electronic">Electronics</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Condition</Form.Label>
                  <Form.Select name="condition" value={filter.condition} onChange={handleFilterChange}>
                    <option value="">All Conditions</option>
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="needs repair">Needs Repair</option>
                    <option value="damaged">Damaged</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Storage Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={filter.location}
                    onChange={handleFilterChange}
                    placeholder="Search location"
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  onClick={() => setShowModal(true)}
                  className="w-100"
                >
                  <i className="fas fa-plus"></i> Add New Utility
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Utilities Table */}
        <Card className="shadow-sm">
          <Card.Header className="text-white py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#FF9800' }}>
            <h5 className="mb-0">Utilities Inventory</h5>
            <Badge bg="light" text="dark">
              Total: {filteredUtilities.length} items
            </Badge>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table bordered hover>
                <thead style={{ backgroundColor: '#E65100', color: 'white' }}>
                  <tr>
                    <th>Utility Code</th>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Storage Location</th>
                    <th>Condition</th>
                    <th>Maintenance</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUtilities.map(utility => (
                    <tr key={utility.id}>
                      <td>
                        <strong>{utility.utilityCode}</strong>
                      </td>
                      <td>{utility.itemDescription}</td>
                      <td>
                        <Badge bg={getCategoryBadge(utility.category)}>
                          {utility.category}
                        </Badge>
                      </td>
                      <td>
                        {utility.quantity} {utility.unitOfMeasure}
                      </td>
                      <td>₹{utility.unitPrice}</td>
                      <td>{utility.storageLocation}</td>
                      <td>
                        <Badge bg={getConditionBadge(utility.conditionStatus)}>
                          {utility.conditionStatus}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          {utility.maintenanceSchedule}<br/>
                          Last: {utility.lastMaintenanceDate}
                        </small>
                      </td>
                      <td>
                        {utility.currentStock <= utility.minimumStockLevel ? (
                          <Badge bg="danger">Low Stock</Badge>
                        ) : (
                          <Badge bg="success">In Stock</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1 mb-1"
                          onClick={() => handleEdit(utility)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mb-1"
                          onClick={() => handleDelete(utility.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#FF9800', color: 'white' }}>
            <Modal.Title>
              {editingUtility ? 'Edit Utility Item' : 'Add New Utility Item'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Item Description *</Form.Label>
                    <Form.Control
                      type="text"
                      name="itemDescription"
                      value={formData.itemDescription}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter item description"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category *</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="cleaning">Cleaning</option>
                      <option value="office">Office Supplies</option>
                      <option value="furniture">Furniture</option>
                      <option value="electronic">Electronics</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity *</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit of Measure *</Form.Label>
                    <Form.Control
                      type="text"
                      name="unitOfMeasure"
                      value={formData.unitOfMeasure}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Piece, Liter, Kg"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit Price (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Storage Location *</Form.Label>
                    <Form.Control
                      type="text"
                      name="storageLocation"
                      value={formData.storageLocation}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Store Room A, Shelf 2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Condition Status</Form.Label>
                    <Form.Select
                      name="conditionStatus"
                      value={formData.conditionStatus}
                      onChange={handleInputChange}
                    >
                      <option value="new">New</option>
                      <option value="good">Good</option>
                      <option value="needs repair">Needs Repair</option>
                      <option value="damaged">Damaged</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maintenance Schedule</Form.Label>
                    <Form.Select
                      name="maintenanceSchedule"
                      value={formData.maintenanceSchedule}
                      onChange={handleInputChange}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="none">None</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Maintenance Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="lastMaintenanceDate"
                      value={formData.lastMaintenanceDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Stock</Form.Label>
                    <Form.Control
                      type="number"
                      name="currentStock"
                      value={formData.currentStock}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Stock Level</Form.Label>
                    <Form.Control
                      type="number"
                      name="minimumStockLevel"
                      value={formData.minimumStockLevel}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingUtility ? 'Update' : 'Save'} Utility Item
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
      <ToastContainer />
    </MainContentPage>
  );
};

export default UtilitiesMaterial;

