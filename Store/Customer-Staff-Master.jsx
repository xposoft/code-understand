"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container, Table, Dropdown, InputGroup, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import { useAuthContext } from "../../Context/AuthContext";
import { ENDPOINTS } from "../../SpringBoot/config";

// Add Customer/Staff Modal Component
const AddCustomerStaffModal = ({ isOpen, onClose, onConfirm, states, districts, staffList }) => {
  const [customerStaffCode, setCustomerStaffCode] = useState("");
  const [customerStaffName, setCustomerStaffName] = useState("");
  const [numberStreetName, setNumberStreetName] = useState("");
  const [placePinCode, setPlacePinCode] = useState("");
  const [stateId, setStateId] = useState("");
  const [state, setState] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [district, setDistrict] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleStateSelect = (id, name) => {
    setStateId(id);
    setState(name);
    setDistrictId(""); // Reset district when state changes
    setDistrict("");
    setIsDropdownOpen(false);
  };

  const handleDistrictSelect = (id, name) => {
    setDistrictId(id);
    setDistrict(name);
    setIsDropdownOpen(false);
  };

  const handleStaffSelect = (staff) => {
    setCustomerStaffCode(staff.staffCode || "");
    setCustomerStaffName(staff.name || "");
    setNumberStreetName(staff.numberStreetName || "");
    setPlacePinCode(staff.placePinCode || "");
    setStateId(staff.stateId || "");
    setState(staff.state || "");
    setDistrictId(staff.districtId || "");
    setDistrict(staff.district || "");
    setPhoneNumber(staff.mobileNumber || "");
    setEmail(staff.emailBankAcId || "");
    setContactPerson(staff.familyHeadName || "");
    setStaffSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleSubmit = () => {
    if (!customerStaffName.trim()) {
      toast.error("Customer/Staff Name is required.");
      return;
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      toast.error("Phone Number must be 10 digits.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid email format.");
      return;
    }
    onConfirm({
      customerStaffCode,
      customerStaffName,
      numberStreetName,
      placePinCode,
      stateId,
      state,
      districtId,
      district,
      phoneNumber,
      email,
      contactPerson,
    });
    // Reset all fields
    setCustomerStaffCode("");
    setCustomerStaffName("");
    setNumberStreetName("");
    setPlacePinCode("");
    setStateId("");
    setState("");
    setDistrictId("");
    setDistrict("");
    setPhoneNumber("");
    setEmail("");
    setContactPerson("");
    setStaffSearchTerm("");
    setIsDropdownOpen(false);
  };

  const filteredStaff = staffList.filter((staff) =>
    staff.name?.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Customer/Staff</h2>
        <div className="modal-body">
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Customer/Staff Name</Form.Label>
                <Dropdown show={isDropdownOpen} onToggle={(isOpen) => setIsDropdownOpen(isOpen)}>
                  <Dropdown.Toggle as={CustomToggle} id="dropdown-staff-name">
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search by name"
                        value={staffSearchTerm}
                        onChange={(e) => {
                          setStaffSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onClick={() => setIsDropdownOpen(true)}
                      />
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                    </InputGroup>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="staff-dropdown-menu">
                    {staffList.length === 0 ? (
                      <Dropdown.Item disabled>Loading staff data...</Dropdown.Item>
                    ) : filteredStaff.length > 0 ? (
                      filteredStaff.map((staff) => (
                        <Dropdown.Item
                          key={staff.id}
                          onClick={() => handleStaffSelect(staff)}
                          className="staff-dropdown-item"
                        >
                          <div className="d-flex justify-content-between">
                            <span>{staff.name || "N/A"}</span>
                            <span>{staff.staffCode || "N/A"}</span>
                          </div>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No staff found</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
                <Form.Control
                  type="text"
                  placeholder="Enter or confirm Customer/Staff Name"
                  value={customerStaffName}
                  onChange={(e) => setCustomerStaffName(e.target.value)}
                  className="custom-input mt-2"
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Customer/Staff Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Customer/Staff Code"
                  value={customerStaffCode}
                  onChange={(e) => setCustomerStaffCode(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Number & Street Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Number & Street Name"
                  value={numberStreetName}
                  onChange={(e) => setNumberStreetName(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Place/Pin Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Place/Pin Code"
                  value={placePinCode}
                  onChange={(e) => setPlacePinCode(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">State</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter or select State"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setStateId(""); // Clear stateId if manually edited
                      setDistrictId("");
                      setDistrict("");
                    }}
                    className="custom-input"
                  />
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-state">
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu">
                      {states.length === 0 ? (
                        <Dropdown.Item disabled>No states available</Dropdown.Item>
                      ) : (
                        states.map((stateItem) => (
                          <Dropdown.Item
                            key={stateItem.id}
                            onClick={() => handleStateSelect(stateItem.id, stateItem.name)}
                          >
                            {stateItem.name}
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">District</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter or select District"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setDistrictId(""); // Clear districtId if manually edited
                    }}
                    className="custom-input"
                    disabled={!state}
                  />
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-district">
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu">
                      {districts.filter((districtItem) => districtItem.stateId === stateId).length === 0 ? (
                        <Dropdown.Item disabled>No districts available</Dropdown.Item>
                      ) : (
                        districts
                          .filter((districtItem) => districtItem.stateId === stateId)
                          .map((districtItem) => (
                            <Dropdown.Item
                              key={districtItem.id}
                              onClick={() => handleDistrictSelect(districtItem.id, districtItem.name)}
                            >
                              {districtItem.name}
                            </Dropdown.Item>
                          ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">E-Mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Contact Person</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Contact Person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

// Custom Dropdown Toggle
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </div>
));

// Edit Customer/Staff Modal Component
const EditCustomerStaffModal = ({ isOpen, onClose, onConfirm, customerStaff, states, districts }) => {
  const [customerStaffName, setCustomerStaffName] = useState(customerStaff?.customerStaffName || "");
  const [numberStreetName, setNumberStreetName] = useState(customerStaff?.numberStreetName || "");
  const [placePinCode, setPlacePinCode] = useState(customerStaff?.placePinCode || "");
  const [stateId, setStateId] = useState(customerStaff?.stateId || "");
  const [state, setState] = useState(customerStaff?.state || "");
  const [districtId, setDistrictId] = useState(customerStaff?.districtId || "");
  const [district, setDistrict] = useState(customerStaff?.district || "");
  const [phoneNumber, setPhoneNumber] = useState(customerStaff?.phoneNumber || "");
  const [email, setEmail] = useState(customerStaff?.email || "");
  const [contactPerson, setContactPerson] = useState(customerStaff?.contactPerson || "");

  useEffect(() => {
    if (customerStaff) {
      setCustomerStaffName(customerStaff.customerStaffName || "");
      setNumberStreetName(customerStaff.numberStreetName || "");
      setPlacePinCode(customerStaff.placePinCode || "");
      setStateId(customerStaff.stateId || "");
      setState(customerStaff.state || "");
      setDistrictId(customerStaff.districtId || "");
      setDistrict(customerStaff.district || "");
      setPhoneNumber(customerStaff.phoneNumber || "");
      setEmail(customerStaff.email || "");
      setContactPerson(customerStaff.contactPerson || "");
    }
  }, [customerStaff]);

  if (!isOpen) return null;

  const handleStateSelect = (id, name) => {
    setStateId(id);
    setState(name);
    setDistrictId("");
    setDistrict("");
  };

  const handleDistrictSelect = (id, name) => {
    setDistrictId(id);
    setDistrict(name);
  };

  const handleSubmit = () => {
    if (!customerStaffName.trim()) {
      toast.error("Customer/Staff Name is required.");
      return;
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      toast.error("Phone Number must be 10 digits.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid email format.");
      return;
    }
    onConfirm({
      id: customerStaff.id,
      customerStaffCode: customerStaff.customerStaffCode,
      customerStaffName,
      numberStreetName,
      placePinCode,
      stateId,
      state,
      districtId,
      district,
      phoneNumber,
      email,
      contactPerson,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Customer/Staff</h2>
        <div className="modal-body">
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Customer/Staff Code</Form.Label>
                <Form.Control
                  type="text"
                  value={customerStaff?.customerStaffCode || ""}
                  readOnly
                  className="custom-input bg-light"
                />
                <Form.Text className="text-muted">Customer/Staff code cannot be changed</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Customer/Staff Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Customer/Staff Name"
                  value={customerStaffName}
                  onChange={(e) => setCustomerStaffName(e.target.value)}
                  className="custom-input"
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Number & Street Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Number & Street Name"
                  value={numberStreetName}
                  onChange={(e) => setNumberStreetName(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Place/Pin Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Place/Pin Code"
                  value={placePinCode}
                  onChange={(e) => setPlacePinCode(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">State</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter or select State"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setStateId("");
                      setDistrictId("");
                      setDistrict("");
                    }}
                    className="custom-input"
                  />
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-state">
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu">
                      {states.length === 0 ? (
                        <Dropdown.Item disabled>No states available</Dropdown.Item>
                      ) : (
                        states.map((stateItem) => (
                          <Dropdown.Item
                            key={stateItem.id}
                            onClick={() => handleStateSelect(stateItem.id, stateItem.name)}
                          >
                            {stateItem.name}
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">District</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter or select District"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setDistrictId("");
                    }}
                    className="custom-input"
                    disabled={!state}
                  />
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-district">
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu">
                      {districts.filter((districtItem) => districtItem.stateId === stateId).length === 0 ? (
                        <Dropdown.Item disabled>No districts available</Dropdown.Item>
                      ) : (
                        districts
                          .filter((districtItem) => districtItem.stateId === stateId)
                          .map((districtItem) => (
                            <Dropdown.Item
                              key={districtItem.id}
                              onClick={() => handleDistrictSelect(districtItem.id, districtItem.name)}
                            >
                              {districtItem.name}
                            </Dropdown.Item>
                          ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">E-Mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Contact Person</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Contact Person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="custom-input"
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update
          </Button>
        </div>
      </div>
    </div>
  );
};

// View Customer/Staff Modal Component
const ViewCustomerStaffModal = ({ isOpen, onClose, customerStaff }) => {
  if (!isOpen || !customerStaff) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Customer/Staff Details</h2>
        <div className="modal-body">
          <Table bordered responsive>
            <tbody>
              <tr>
                <td><strong>Customer/Staff Code</strong></td>
                <td>{customerStaff.customerStaffCode || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Customer/Staff Name</strong></td>
                <td>{customerStaff.customerStaffName || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Number & Street Name</strong></td>
                <td>{customerStaff.numberStreetName || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Place/Pin Code</strong></td>
                <td>{customerStaff.placePinCode || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>State</strong></td>
                <td>{customerStaff.state || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>District</strong></td>
                <td>{customerStaff.district || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Phone Number</strong></td>
                <td>{customerStaff.phoneNumber || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>E-Mail</strong></td>
                <td>{customerStaff.email || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Contact Person</strong></td>
                <td>{customerStaff.contactPerson || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Created At</strong></td>
                <td>{customerStaff.createdAt || "N/A"}</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Delete Customer/Staff Modal Component
const DeleteCustomerStaffModal = ({ isOpen, onClose, onConfirm, customerStaff }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Customer/Staff</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this customer/staff?</p>
          <p className="fw-bold">{customerStaff?.customerStaffName || "N/A"}</p>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button delete" onClick={() => onConfirm(customerStaff.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, customerStaff, newCustomerStaff }) => {
  if (!isOpen || !customerStaff || !newCustomerStaff) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this customer/staff? This may affect related data.</p>
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Field</th>
                <th>Current Value</th>
                <th>New Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Customer/Staff Code</td>
                <td>{customerStaff.customerStaffCode || "N/A"}</td>
                <td>{newCustomerStaff.customerStaffCode || "N/A"}</td>
              </tr>
              <tr>
                <td>Customer/Staff Name</td>
                <td>{customerStaff.customerStaffName || "N/A"}</td>
                <td>{newCustomerStaff.customerStaffName || "N/A"}</td>
              </tr>
              <tr>
                <td>Number & Street Name</td>
                <td>{customerStaff.numberStreetName || "N/A"}</td>
                <td>{newCustomerStaff.numberStreetName || "N/A"}</td>
              </tr>
              <tr>
                <td>Place/Pin Code</td>
                <td>{customerStaff.placePinCode || "N/A"}</td>
                <td>{newCustomerStaff.placePinCode || "N/A"}</td>
              </tr>
              <tr>
                <td>State</td>
                <td>{customerStaff.state || "N/A"}</td>
                <td>{newCustomerStaff.state || "N/A"}</td>
              </tr>
              <tr>
                <td>District</td>
                <td>{customerStaff.district || "N/A"}</td>
                <td>{newCustomerStaff.district || "N/A"}</td>
              </tr>
              <tr>
                <td>Phone Number</td>
                <td>{customerStaff.phoneNumber || "N/A"}</td>
                <td>{newCustomerStaff.phoneNumber || "N/A"}</td>
              </tr>
              <tr>
                <td>E-Mail</td>
                <td>{customerStaff.email || "N/A"}</td>
                <td>{newCustomerStaff.email || "N/A"}</td>
              </tr>
              <tr>
                <td>Contact Person</td>
                <td>{customerStaff.contactPerson || "N/A"}</td>
                <td>{newCustomerStaff.contactPerson || "N/A"}</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div className="modal-footer">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="modal-button confirm" onClick={onConfirm}>
            Confirm Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

const CustomerStaffMaster = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
  const [selectedCustomerStaff, setSelectedCustomerStaff] = useState(null);
  const [newCustomerStaffData, setNewCustomerStaffData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerStaffList, setCustomerStaffList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState({
    init: true,
    customerStaffList: false,
    staffList: false,
    states: false,
    districts: false,
    delete: false,
  });
  const [error, setError] = useState(null);
  const { user, currentAcademicYear, schoolId } = useAuthContext();

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token") || sessionStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-School-ID": schoolId,
      "X-Academic-Year": currentAcademicYear,
    };
  };

  useEffect(() => {
    if (user && currentAcademicYear && schoolId) {
      fetchCustomerStaffList();
      fetchStaffList();
      fetchStates();
      fetchDistricts();
    } else {
      setError(user ? "Please select an academic year." : "User not authenticated. Please log in.");
      toast.error(user ? "Please select an academic year." : "User not authenticated. Please log in.");
      setLoading((prev) => ({ ...prev, init: false }));
    }
  }, [user, currentAcademicYear, schoolId]);

  const fetchCustomerStaffList = async () => {
    if (!currentAcademicYear || !schoolId) return;

    try {
      setLoading((prev) => ({ ...prev, customerStaffList: true }));
      setError(null);
      const response = await fetch(
        `${ENDPOINTS.store}/customerstaff?schoolId=${schoolId}&academicYear=${currentAcademicYear}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const customerStaffData = await response.json();
      setCustomerStaffList(customerStaffData);
    } catch (error) {
      console.error("Error fetching customer/staff list:", error);
      setError("Failed to fetch customer/staff list. Please try again.");
      toast.error(`Failed to fetch customer/staff list: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, customerStaffList: false, init: false }));
    }
  };

  const fetchStaffList = async () => {
    if (!currentAcademicYear || !schoolId) return;

    try {
      setLoading((prev) => ({ ...prev, staffList: true }));
      setError(null);
      const response = await fetch(
        `${ENDPOINTS.administration}/staff?schoolId=${schoolId}&academicYear=${currentAcademicYear}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const staffData = await response.json();
      setStaffList(staffData);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      setError("Failed to fetch staff list. Please try again.");
      toast.error(`Failed to fetch staff list: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, staffList: false }));
    }
  };

  const fetchStates = async () => {
    if (!currentAcademicYear || !schoolId) return;

    try {
      setLoading((prev) => ({ ...prev, states: true }));
      setError(null);
      const response = await fetch(
        `${ENDPOINTS.administration}/staff-dropdowns/states?schoolId=${schoolId}&academicYear=${currentAcademicYear}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const statesData = await response.json();
      const formattedStates = statesData.map((state) => ({
        id: state.id,
        name: state.name || state.state,
      }));
      setStates(formattedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
      setError("Failed to fetch states. Please try again.");
      toast.error(`Failed to fetch states: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, states: false }));
    }
  };

  const fetchDistricts = async () => {
    if (!currentAcademicYear || !schoolId) return;

    try {
      setLoading((prev) => ({ ...prev, districts: true }));
      setError(null);
      const response = await fetch(
        `${ENDPOINTS.administration}/staff-dropdowns/districts?schoolId=${schoolId}&academicYear=${currentAcademicYear}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const districtsData = await response.json();
      const formattedDistricts = districtsData.map((district) => ({
        id: district.id,
        name: district.name || district.district,
        stateId: district.stateId,
      }));
      setDistricts(formattedDistricts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setError("Failed to fetch districts. Please try again.");
      toast.error(`Failed to fetch districts: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const handleAddCustomerStaff = async (data) => {
    if (!currentAcademicYear || !schoolId) {
      toast.error("School or academic year not initialized. Please try again.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, customerStaffList: true }));
      const response = await fetch(`${ENDPOINTS.store}/customerstaff`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          schoolId,
          academicYear: currentAcademicYear,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsAddModalOpen(false);
      toast.success("Customer/Staff added successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      await fetchCustomerStaffList();
    } catch (error) {
      console.error("Error adding customer/staff:", error);
      toast.error(`Failed to add customer/staff: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, customerStaffList: false }));
    }
  };

  const handleEditCustomerStaff = async (data) => {
    setIsEditModalOpen(false);
    setIsConfirmEditModalOpen(true);
    setNewCustomerStaffData({
      ...data,
      schoolId,
      academicYear: currentAcademicYear,
    });
  };

  const confirmEditCustomerStaff = async () => {
    if (!currentAcademicYear || !schoolId) {
      toast.error("School or academic year not initialized. Please try again.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, customerStaffList: true }));
      const response = await fetch(`${ENDPOINTS.store}/customerstaff/${newCustomerStaffData.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(newCustomerStaffData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsConfirmEditModalOpen(false);
      setSelectedCustomerStaff(null);
      setNewCustomerStaffData(null);
      toast.success("Customer/Staff updated successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      await fetchCustomerStaffList();
    } catch (error) {
      console.error("Error updating customer/staff:", error);
      toast.error(`Failed to update customer/staff: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, customerStaffList: false }));
    }
  };

  const handleDeleteCustomerStaff = async (id) => {
    if (!currentAcademicYear || !schoolId) {
      toast.error("School or academic year not initialized. Please try again.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      const response = await fetch(
        `${ENDPOINTS.store}/customerstaff/${id}?schoolId=${schoolId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsDeleteModalOpen(false);
      setSelectedCustomerStaff(null);
      toast.success("Customer/Staff deleted successfully!", {
        style: { background: "#0B3D7B", color: "white" },
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      await fetchCustomerStaffList();
    } catch (error) {
      console.error("Error deleting customer/staff:", error);
      toast.error(`Failed to delete customer/staff: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const openEditModal = (customerStaff) => {
    setSelectedCustomerStaff(customerStaff);
    setIsEditModalOpen(true);
  };

  const openViewModal = (customerStaff) => {
    setSelectedCustomerStaff(customerStaff);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (customerStaff) => {
    setSelectedCustomerStaff(customerStaff);
    setIsDeleteModalOpen(true);
  };

  const handleReset = () => {
    setSearchTerm("");
  };

  const filteredCustomerStaff = customerStaffList.filter((cs) =>
    (cs.customerStaffCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cs.customerStaffName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Store</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Customer / Staff Master</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="customer-staff-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                  <h2 className="m-0 d-none d-lg-block">Customer / Staff Master</h2>
                  <h6 className="m-0 d-lg-none">Customer / Staff Master</h6>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-light text-dark"
                    disabled={isAnyLoading || !currentAcademicYear || !schoolId}
                  >
                    + Add Customer/Staff
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {loading.init ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status" style={{ color: "#0B3D7B" }}>
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Initializing...</p>
                    </div>
                  ) : !currentAcademicYear || !schoolId ? (
                    <div className="alert alert-warning">Please select an academic year and school to manage customer/staff data.</div>
                  ) : error ? (
                    <div className="text-center text-danger">
                      <p>{error}</p>
                      <Button
                        variant="primary"
                        onClick={() => {
                          fetchCustomerStaffList();
                          fetchStaffList();
                          fetchStates();
                          fetchDistricts();
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <div className="d-flex mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Search by Customer/Staff Code or Name"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="custom-search me-2"
                          disabled={isAnyLoading}
                        />
                        <Button
                          variant="danger"
                          onClick={handleReset}
                          disabled={isAnyLoading || !searchTerm}
                        >
                          Reset
                        </Button>
                      </div>

                      {/* Customer/Staff Table */}
                      <div className="table-responsive">
                        {loading.customerStaffList ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" role="status" style={{ color: "#0B3D7B" }}>
                              <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="mt-2">Loading customer/staff data...</p>
                          </div>
                        ) : filteredCustomerStaff.length === 0 ? (
                          <div className="alert alert-info">No customer/staff found. Add a new customer/staff to get started.</div>
                        ) : (
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th>Contact Person</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredCustomerStaff.map((cs) => (
                                <tr key={cs.id}>
                                  <td>{cs.customerStaffCode || "N/A"}</td>
                                  <td>{cs.customerStaffName || "N/A"}</td>
                                  <td>{cs.phoneNumber || "N/A"}</td>
                                  <td>{cs.email || "N/A"}</td>
                                  <td>{cs.contactPerson || "N/A"}</td>
                                  <td>
                                    <Button
                                      variant="link"
                                      className="action-button view-button me-2"
                                      onClick={() => openViewModal(cs)}
                                      disabled={isAnyLoading}
                                    >
                                      <FaEye />
                                    </Button>
                                    <Button
                                      variant="link"
                                      className="action-button edit-button me-2"
                                      onClick={() => openEditModal(cs)}
                                      disabled={isAnyLoading}
                                    >
                                      <FaEdit />
                                    </Button>
                                    <Button
                                      variant="link"
                                      className="action-button delete-button"
                                      onClick={() => openDeleteModal(cs)}
                                      disabled={isAnyLoading}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <AddCustomerStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddCustomerStaff}
        states={states}
        districts={districts}
        staffList={staffList}
      />
      <EditCustomerStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomerStaff(null);
        }}
        onConfirm={handleEditCustomerStaff}
        customerStaff={selectedCustomerStaff}
        states={states}
        districts={districts}
      />
      <ViewCustomerStaffModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCustomerStaff(null);
        }}
        customerStaff={selectedCustomerStaff}
      />
      <DeleteCustomerStaffModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCustomerStaff(null);
        }}
        onConfirm={handleDeleteCustomerStaff}
        customerStaff={selectedCustomerStaff}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false);
          setSelectedCustomerStaff(null);
          setNewCustomerStaffData(null);
        }}
        onConfirm={confirmEditCustomerStaff}
        customerStaff={selectedCustomerStaff}
        newCustomerStaff={newCustomerStaffData}
      />

      {/* Toastify Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <style>
        {`
          .customer-staff-container {
            background-color: #fff;
          }

          .custom-breadcrumb {
            padding: 0.5rem 1rem;
          }

          .custom-breadcrumb a {
            color: #0B3D7B;
            text-decoration: none;
          }

          .custom-breadcrumb .separator {
            margin: 0 0.5rem;
            color: #6c757d;
          }

          .custom-breadcrumb .current {
            color: #212529;
          }

          .form-card {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
          }

          .header {
            border-bottom: 1px solid #dee2e6;
          }

          .custom-search {
            max-width: 300px;
          }

          .table-responsive {
            margin-bottom: 0;
          }

          .table th {
            font-weight: 500;
          }

          .table td {
            vertical-align: middle;
          }

          .action-button {
            width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            padding: 0;
            color: white;
          }

          .view-button {
            background-color: #28a745;
          }

          .view-button:hover {
            background-color: #218838;
            color: white;
          }

          .edit-button {
            background-color: #0B3D7B;
          }

          .edit-button:hover {
            background-color: #092a54;
            color: white;
          }

          .delete-button {
            background-color: #dc3545;
          }

          .delete-button:hover {
            background-color: #bb2d3b;
            color: white;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1100;
          }

          .modal-content {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .modal-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #0B3D7B;
            text-align: center;
          }

          .modal-body {
            margin-bottom: 1.5rem;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e9ecef;
          }

          .modal-button {
            padding: 0.5rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.2s;
          }

          .modal-button.confirm {
            background-color: #0B3D7B;
            color: white;
          }

          .modal-button.confirm:hover {
            background-color: #092a54;
          }

          .modal-button.delete {
            background-color: #dc3545;
            color: white;
          }

          .modal-button.delete:hover {
            background-color: #bb2d3b;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
          }

          .modal-button.cancel:hover {
            background-color: #5a6268;
          }

          .custom-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ced4da;
            border-radius: 6px;
            font-size: 0.9rem;
          }

          .custom-input:focus {
            border-color: #0B3D7B;
            box-shadow: 0 0 0 0.2rem rgba(11, 61, 123, 0.25);
          }

          .form-label {
            font-size: 0.9rem;
            color: #333;
          }

          .staff-dropdown-menu, .dropdown-menu {
            width: 100%;
            max-height: 200px;
            overflow-y: auto;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .staff-dropdown-item, .dropdown-menu .dropdown-item {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .staff-dropdown-item:hover, .dropdown-menu .dropdown-item:hover {
            background-color: #f1f5f9;
          }

          .staff-dropdown-item span {
            flex: 1;
            text-align: left;
          }

          .staff-dropdown-item span:last-child {
            text-align: right;
            color: #6c757d;
          }

          .Toastify__toast-container {
            z-index: 9999;
          }

          .Toastify__toast {
            background-color: #0B3D7B;
            color: white;
            border-radius: 6px;
          }

          .Toastify__toast--success {
            background-color: #0B3D7B;
          }

          .Toastify__toast--error {
            background-color: #dc3545;
          }

          .Toastify__progress-bar {
            background-color: rgba(255, 255, 255, 0.7);
          }
        `}
      </style>
    </MainContentPage>
  );
};

export default CustomerStaffMaster;