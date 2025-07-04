import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import { all_routes } from '../../router/all_routes';
import { Link, useNavigate } from 'react-router-dom';
import Table from "../../../core/common/dataTable/index";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import PredefinedDateRanges from '../../../core/common/datePicker';
import { DatePicker } from 'antd';
import CommonSelect from '../../../core/common/commonSelect';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import { notification } from 'antd';

// Add this line at the very top
declare const process: {
  env: {
    REACT_APP_BACKEND_URL: string;
    [key: string]: string | undefined;
  };
};

type PasswordField = "password" | "confirmPassword";

// Define Employee type
interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: string;
  about: string;
  image?: string;
}

const department = [
  { value: "Select", label: "Select" },
  { value: "All Department", label: "All Department" },
  { value: "Finance", label: "Finance" },
  { value: "Developer", label: "Developer" },
  { value: "Executive", label: "Executive" },
];
const designation = [
  { value: "Select", label: "Select" },
  { value: "Finance", label: "Finance" },
  { value: "Developer", label: "Developer" },
  { value: "Executive", label: "Executive" },
];

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await fetch(`${backendUrl}/api/employees`);
    const data = await res.json();
    setEmployees(data.map((emp: Employee) => ({ ...emp, key: emp._id })));
    setLoading(false);
    console.log('Fetched employees:', data); // Debug
  };

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle add employee with FormData
  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (imageInputRef.current && imageInputRef.current.files && imageInputRef.current.files[0]) {
      formData.set('image', imageInputRef.current.files[0]);
    }
    try {
      const res = await fetch(`${backendUrl}/api/employees`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        notification.success({ message: 'Employee added successfully!' });
        fetchEmployees();
        const modalEl = document.getElementById('add_employee');
        if (modalEl) {
          const modal = Modal.getOrCreateInstance(modalEl);
          modal.hide();
        }
        form.reset();
        setImagePreview(null);
        setTimeout(() => navigate('/react/template/employees', { replace: true }), 1000);
      } else {
        const data = await res.json();
        notification.error({ message: data.message || 'Failed to add employee' });
      }
    } catch (err) {
      notification.error({ message: 'Server error. Please try again later.' });
    }
  };

  const handleEditEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const updatedEmployee: any = Object.fromEntries(formData.entries());
    if (updatedEmployee.joiningDate instanceof Date) {
      updatedEmployee.joiningDate = (updatedEmployee.joiningDate as Date).toISOString();
    }
    try {
      const res = await fetch(`${backendUrl}/api/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmployee),
      });
      if (res.ok) {
        notification.success({ message: 'Employee updated successfully!' });
        fetchEmployees();
        const modalEl = document.getElementById('edit_employee');
        if (modalEl) {
          const modal = Modal.getOrCreateInstance(modalEl);
          modal.hide();
        }
        setSelectedEmployee(null);
        setTimeout(() => navigate('/react/template/employees', { replace: true }), 1000);
      } else {
        const data = await res.json();
        notification.error({ message: data.message || 'Failed to update employee' });
      }
    } catch (err) {
      notification.error({ message: 'Server error. Please try again later.' });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Delete this employee?')) return;
    await fetch(`${backendUrl}/api/employees/${id}`, { method: 'DELETE' });
    fetchEmployees();
  };

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const columns = [
    {
      title: "Emp ID",
      dataIndex: "employeeId",
      render: (text: String, record: Employee) => (
        <Link to={all_routes.employeedetails}>{text}</Link>
      ),
      sorter: (a: Employee, b: Employee) => a.employeeId.length - b.employeeId.length,
    },
    {
      title: "Name",
      dataIndex: "firstName",
      render: (text: string, record: Employee) => (
        <div className="d-flex align-items-center">
          <Link
            to={all_routes.employeedetails}
            className="avatar avatar-md"
            data-bs-toggle="modal" data-inert={true}
            data-bs-target="#view_details"
          >
            <ImageWithBasePath
              src={record.image ? `${backendUrl}/api/employees/uploads/${record.image}` : 'assets/img/users/default.jpg'}
              className="img-fluid rounded-circle"
              alt="img"
            />
          </Link>
          <div className="ms-2">
            <p className="text-dark mb-0">
              <Link
                to={all_routes.employeedetails}
                data-bs-toggle="modal" data-inert={true}
                data-bs-target="#view_details"
              >
                {record.firstName} {record.lastName}
              </Link>
            </p>
            <span className="fs-12">{record.designation}</span>
          </div>
        </div>
      ),
      sorter: (a: Employee, b: Employee) => a.firstName.length - b.firstName.length,
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a: Employee, b: Employee) => a.email.length - b.email.length,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      sorter: (a: Employee, b: Employee) => a.phone.length - b.phone.length,
    },
    {
      title: "Designation",
      dataIndex: "designation",
      render: (text: string, record: Employee) => (
        <div className="dropdown me-3">
          <Link
            to="#"
            className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            {record.designation}
          </Link>
          <ul className="dropdown-menu  dropdown-menu-end p-3">
            <li>
              <Link to="#" className="dropdown-item rounded-1">Developer</Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item rounded-1">Executive</Link>
            </li>
          </ul>
        </div>
      ),
      sorter: (a: Employee, b: Employee) => a.designation.length - b.designation.length,
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      render: (text: string) => text ? new Date(text).toLocaleDateString() : '',
      sorter: (a: Employee, b: Employee) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string, record: Employee) => (
        <span className={`badge ${text === 'Active' ? 'badge-success' : 'badge-danger'} d-inline-flex align-items-center badge-xs`}>
          <i className="ti ti-point-filled me-1" />
          {text}
        </span>
      ),
      sorter: (a: Employee, b: Employee) => a.status.length - b.status.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_: any, record: Employee) => (
        <div className="action-icon d-inline-flex">
          <Link
            to="#"
            className="me-2"
            data-bs-toggle="modal" data-inert={true}
            data-bs-target="#edit_employee"
            onClick={() => { setSelectedEmployee(record); setModalType('edit'); }}
          >
            <i className="ti ti-edit" />
          </Link>
          <Link to="#" onClick={() => handleDeleteEmployee(record._id)}>
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
    },
  ];

  const getModalContainer = () => {
    const modalElement = document.getElementById('modal-datepicker');
    return modalElement ? modalElement : document.body;
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Employee</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Employee List
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    to={all_routes.employeeList}
                    className="btn btn-icon btn-sm active bg-primary text-white me-1"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  <Link to={all_routes.employeeGrid} className="btn btn-icon btn-sm">
                    <i className="ti ti-layout-grid" />
                  </Link>
                </div>
              </div>
              <div className="me-2 mb-2">
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-file-export me-1" />
                    Export
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mb-2">
                <Link
                  to="#"
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#add_employee"
                  className="btn btn-primary d-flex align-items-center"
                  onClick={() => { setSelectedEmployee(null); setModalType('add'); }}
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Employee
                </Link>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="row">
            {/* Cards can remain as is or be updated to use employees.length, etc. */}
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Employee List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                {/* Filters can be added here if needed */}
              </div>
            </div>
            <div className="card-body p-0">
              <Table dataSource={employees} columns={columns} Selection={true} />
            </div>
          </div>
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014 - 2025 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Add Employee Modal */}
      <div className="modal fade" id="add_employee">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <h4 className="modal-title me-2">Add New Employee</h4>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleAddEmployee}>
                  <div className="modal-body pb-0 ">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">First Name *</label>
                      <input name="firstName" type="text" className="form-control" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                      <input name="lastName" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Employee ID *</label>
                      <input name="employeeId" type="text" className="form-control" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Joining Date *</label>
                      <input name="joiningDate" type="date" className="form-control" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Email *</label>
                      <input name="email" type="email" className="form-control" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Phone *</label>
                      <input name="phone" type="text" className="form-control" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                      <input name="department" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Designation</label>
                      <input name="designation" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                      <label className="form-label">About</label>
                      <textarea name="about" className="form-control" rows={3} />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Image</label>
                          <input type="file" name="image" ref={imageInputRef} onChange={handleImageChange} />
                          {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%' }} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                <button type="submit" className="btn btn-primary">
                  Save
                    </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Employee Modal */}
      {/* Edit Employee Modal */}
      <div className="modal fade" id="edit_employee">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <h4 className="modal-title me-2">Edit Employee</h4>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleEditEmployee}>
                  <div className="modal-body pb-0 ">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">First Name *</label>
                      <input name="firstName" type="text" className="form-control" required defaultValue={selectedEmployee?.firstName || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                      <input name="lastName" type="text" className="form-control" defaultValue={selectedEmployee?.lastName || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Employee ID *</label>
                      <input name="employeeId" type="text" className="form-control" required defaultValue={selectedEmployee?.employeeId || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Joining Date *</label>
                      <input name="joiningDate" type="date" className="form-control" required defaultValue={selectedEmployee?.joiningDate ? new Date(selectedEmployee.joiningDate).toISOString().split('T')[0] : ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Email *</label>
                      <input name="email" type="email" className="form-control" required defaultValue={selectedEmployee?.email || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                      <label className="form-label">Phone *</label>
                      <input name="phone" type="text" className="form-control" required defaultValue={selectedEmployee?.phone || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                      <input name="department" type="text" className="form-control" defaultValue={selectedEmployee?.department || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Designation</label>
                      <input name="designation" type="text" className="form-control" defaultValue={selectedEmployee?.designation || ''} />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                      <label className="form-label">About</label>
                      <textarea name="about" className="form-control" rows={3} defaultValue={selectedEmployee?.about || ''} />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Image</label>
                          <input type="file" name="image" ref={imageInputRef} onChange={handleImageChange} />
                          {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%' }} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                <button type="submit" className="btn btn-primary">
                  Save
                    </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Employee Modal */}
    </>
  );
};

export default EmployeeList;
