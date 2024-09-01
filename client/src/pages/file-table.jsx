import axios from 'axios';
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import MultiSelect from "../components/multi-select";
import FileView from "../components/view-file";
import FileUpload from "../components/upload-file";
import { useAuth } from "../contextes/auth-context";
import useFileUpload from "../hooks/usefileupload";
import "../style/cards.css";

const FileTable = () => {
  // User authentication context
  const { user } = useAuth();

  // State variables
  const [queryData, setQueryData] = useState([]);
  const [fileMetaData, setFileMetaData] = useState([]);
  const [filenameOptions, setFilenameOptions] = useState([]);
  const [fileExtensionOptions, setFileExtensionOptions] = useState([]);
  const [fileOwnerOptions, setFileOwnerOptions] = useState([]);
  const [selectedFilenameOptions, setSelectedFilenameOptions] = useState([]);
  const [selectedFileExtensionOptions, setSelectedFileExtensionOptions] = useState([]);
  const [selectedFileOwnerOptions, setSelectedFileOwnerOptions] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  // UI interaction handlers
  const handleCloseModal = () => setShowUploadModal(false);
  const handleShowModal = () => setShowUploadModal(true);
  const handleNameSelect = vData => setSelectedFilenameOptions(vData || []);
  const handleExtensionSelect = vData => setSelectedFileExtensionOptions(vData || []);
  const handleOwnerSelect = vData => setSelectedFileOwnerOptions(vData || []);

  // Reports the response of the file download to the user
  const handleFileDownload = (response) => {
    setResultMessage(response);
    setTimeout(() => setResultMessage(null), 10000);  // Reset resultMessage after 10 seconds
  };

  // Reports the response of the file delete to the user
  const handleFileDelete = (response) => {    
    setResultMessage(response);
    fetchFiles(); // Refresh the file list shown in the table
    setTimeout(() => setResultMessage(null), 10000);  // Reset resultMessage after 10 seconds
  };

  // Reports the response of the file upload to the user
  const handleFileUpload = async () => {
    if (user) {
      const { success, message, metadata } = await handleUpload();
      if (success) {        
        setQueryData((prevData) => [...prevData, metadata]);
      } else {
        setResultMessage(message);
      }
    } else {
      console.error("User not logged in");
    }
  };

  // Custom Hook for File Upload
  const uploadUrl = "http://localhost/upload";
  const { handleFileChange, handleUpload, resultMsg } = useFileUpload(uploadUrl, handleCloseModal);

  // Set the result message from the file upload
  useEffect(() => {
    if (resultMsg) setResultMessage(resultMsg);
    setTimeout(() => setResultMessage(null), 10000);  // Reset resultMessage after 10 seconds
  }, [resultMsg]);

  // Fetch file metadata from the database server on startup
  useEffect(() => {fetchFiles()}, []);

  // Fetch file metadata from the database server on startup
  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost/getFiles');
      if (response.status === 200) {
        setQueryData(response.data.message);
      } else {
        console.error('Failed to fetch files');
      }
    } catch (error) {
      if (error.response) {
        console.error(`Error: ${error.response.data.message || 'An error occurred while fetching files'}`);
      } else if (error.request) {
        console.error('Error: No response received from the server');
      } else {
        console.error('Error: An unexpected error occurred');
      }
    }
  };
  
  // Generate unique select options from file metadata
  const generateSelectOptions = useCallback((data, key) => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map((item) => item[key]))].map((value) => ({
      label: value,
      value,
    }));
  }, []);

  // Set the select options for filename, file extension, and file owner
  const setStatesForSelectOptionsFromBaseData = useCallback(
    (data) => {
      if (!data || data.length === 0) {
        setFilenameOptions([]);
        setFileExtensionOptions([]);
        setFileOwnerOptions([]);
        return;
      }

      // Generate select options from query data or filtred data
      const uniqueFilenames =
        selectedFilenameOptions.length > 0
          ? generateSelectOptions(queryData, "name")
          : generateSelectOptions(data, "name");
      const uniqueFileExtensions =
        selectedFileExtensionOptions.length > 0
          ? generateSelectOptions(queryData, "file_type")
          : generateSelectOptions(data, "file_type");
      const uniqueFileOwners =
        selectedFileOwnerOptions.length > 0
          ? generateSelectOptions(queryData, "username")
          : generateSelectOptions(data, "username");

      setFilenameOptions(uniqueFilenames);
      setFileExtensionOptions(uniqueFileExtensions);
      setFileOwnerOptions(uniqueFileOwners);
    },
    [
      queryData,
      generateSelectOptions,
      selectedFilenameOptions,
      selectedFileExtensionOptions,
      selectedFileOwnerOptions,
    ]
  );

  
  // Update the file metadata and select options when the query data changes
  useEffect(() => {
    if (!queryData) return;

    setFileMetaData(queryData);
    setStatesForSelectOptionsFromBaseData(queryData);
  }, [queryData, setStatesForSelectOptionsFromBaseData]);

  // Update the file metadata and select options when the select options change
  useEffect(() => {
    if (!queryData || queryData.length === 0) return;

    let filteredData = queryData;
    if (selectedFilenameOptions.length > 0) {
      filteredData = filteredData.filter((file) =>
        selectedFilenameOptions.map((option) => option.value).includes(file.name)
      );
    }
    if (selectedFileExtensionOptions.length > 0) {
      filteredData = filteredData.filter((file) =>
        selectedFileExtensionOptions.map((option) => option.value).includes(file.file_type)
      );
    }
    if (selectedFileOwnerOptions.length > 0) {
      filteredData = filteredData.filter((file) =>
        selectedFileOwnerOptions.map((option) => option.value).includes(file.username)
      );
    }
    setStatesForSelectOptionsFromBaseData(filteredData);
    setFileMetaData(filteredData);
  }, [
    selectedFilenameOptions,
    selectedFileExtensionOptions,
    selectedFileOwnerOptions,
    queryData,
    setStatesForSelectOptionsFromBaseData,
  ]);

  // Render the file views from the file metadata
  const renderFileViews = (data) => {
    return data.map((file, index) => (
      <FileView key={index} file_meta_data={file} onDelete={handleFileDelete} onDownload={handleFileDownload} />
    ));
  };
  
  return (
    <Container fluid style={{ marginTop: '30px', marginBottom: '30px' }}>
      <Row className="justify-content-center mb-3">
        <Col md={2}>
          <MultiSelect
            placeholder="Select filename"
            onChange={handleNameSelect}
            options={filenameOptions}
            value={selectedFilenameOptions}
            isMulti
          />
        </Col>
        <Col md={2}>
          <MultiSelect
            placeholder="Select file extension"
            onChange={handleExtensionSelect}
            options={fileExtensionOptions}
            value={selectedFileExtensionOptions}
            isMulti
          />
        </Col>
        <Col md={2}>
          <MultiSelect
            placeholder="Select owner"
            onChange={handleOwnerSelect}
            options={fileOwnerOptions}
            value={selectedFileOwnerOptions}
            isMulti
          />
        </Col>
        <Col md={3}></Col>
        <Col md={1} className="d-flex justify-content-end align-items-top">
          <Button
            variant="success"
            className="btn-md square-button"
            onClick={handleShowModal}
            disabled={!user}
          >
            +
          </Button>
          <FileUpload
            show={showUploadModal}
            handleClose={handleCloseModal}
            handleFileChange={handleFileChange}
            handleUpload={handleFileUpload}
          />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={4}></Col>
        <Col md={4} className="d-flex justify-content-center align-items-center">
          {resultMessage}
        </Col>
        <Col md={4}></Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card bg="dark" text="white">
            <Card.Header>
              <Container fluid>
                <Row className="table-header">
                  <Col md={4}>Filename</Col>
                  <Col md={1}>Extension</Col>
                  <Col md={1}>Size</Col>
                  <Col md={2}>Owner</Col>
                  <Col md={2}>Modified</Col>
                  <Col md={2}>Actions</Col>
                </Row>
              </Container>
            </Card.Header>
            <Card.Body>
              {renderFileViews(fileMetaData)}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileTable;
