import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useState, useEffect, useCallback } from "react";

import MultiSelect from "../components/multiselect";
import FileView from "../components/fileview";
import FileUpload from '../components/fileupload';

import useFileUpload from '../hooks/usefileupload';
import testData from "../testdata.json"; 
import "../style/cards.css";

const FileTable = () => {
  // State Initialization
  const [queryData, setQueryData] = useState([]);
  const [fileMetaData, setFileMetaData] = useState([]); 
  const [filenameOptions, setFilenameOptions] = useState([]); 
  const [fileExtensionOptions, setFileExtensionOptions] = useState([]); 
  const [fileOwnerOptions, setFileOwnerOptions] = useState([]); 
  const [selectedFilenameOptions, setSelectedFilenameOptions] = useState([]);
  const [selectedFileExtensionOptions, setSelectedFileExtensionOptions] = useState([]);
  const [selectedFileOwnerOptions, setSelectedFileOwnerOptions] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Custom Hook for File Upload
  const uploadUrl = 'http://localhost:3000/upload';
  // eslint-disable-next-line no-unused-vars
  const {selectedFile, handleFileChange, handleUpload } = useFileUpload(uploadUrl, handleCloseModal);


  // Callback to generate select options based on key
  const generateSelectOptions = useCallback((data, key) => {
    return [...new Set(data.map(item => item[key]))].map(value => ({ label: value, value }));
  }, []);

  // Helper function to set state for select options
  const setStatesForSelectOptionsFromBaseData = useCallback((data) => {
    const uniqueFilenames = selectedFilenameOptions.length > 0 ? 
      generateSelectOptions(queryData, 'name') : generateSelectOptions(data, 'name');
    const uniqueFileExtensions = generateSelectOptions(data, 'extension');
    const uniqueFileOwners = generateSelectOptions(data, 'owner');

    setFilenameOptions(uniqueFilenames);
    setFileExtensionOptions(uniqueFileExtensions);
    setFileOwnerOptions(uniqueFileOwners);
  }, [queryData, selectedFilenameOptions, generateSelectOptions]);

  // Data fetching and setting initial state
  useEffect(() => {
    setQueryData(testData);
  }, []);

  // Update options for filters based on data
  useEffect(() => {
    setFileMetaData(queryData);
    setStatesForSelectOptionsFromBaseData(queryData);
  }, [queryData, setStatesForSelectOptionsFromBaseData]);

  // Filtering data based on selected options
  useEffect(() => {
    let filteredData = queryData;
    if (selectedFilenameOptions.length > 0) {
      filteredData = filteredData.filter(file => selectedFilenameOptions.map(option => option.value).includes(file.name));
    }
    if (selectedFileExtensionOptions.length > 0) {
      filteredData = filteredData.filter(file => selectedFileExtensionOptions.map(option => option.value).includes(file.extension));
    }
    if (selectedFileOwnerOptions.length > 0) {
      filteredData = filteredData.filter(file => selectedFileOwnerOptions.map(option => option.value).includes(file.owner));
    }
    setStatesForSelectOptionsFromBaseData(filteredData);
    setFileMetaData(filteredData);
  }, [
    selectedFilenameOptions, 
    selectedFileExtensionOptions, 
    selectedFileOwnerOptions, 
    queryData, 
    setStatesForSelectOptionsFromBaseData
  ]);

  // Handlers for UI interactions
  const handleCloseModal = () => setShowUploadModal(false);
  const handleShowModal = () => setShowUploadModal(true);
  const handleNameSelect = (vData) => setSelectedFilenameOptions(vData || []);
  const handleExtensionSelect = (vData) => setSelectedFileExtensionOptions(vData || []);
  const handleOwnerSelect = (vData) => setSelectedFileOwnerOptions(vData || []);

  // Rendering file views
  const renderFileViews = (data) => {
    return data.map((file, index) => (
      <FileView key={index} file_meta_data={file} />
    ));
  };

  return (
    <Container fluid style={{ marginTop: "30px", marginBottom: "30px" }}>
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
          <Button variant="success" className="btn-md square-button" onClick={handleShowModal}>
            +
          </Button>
          <FileUpload 
            show={showUploadModal} 
            handleClose={handleCloseModal} 
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
          />
        </Col>
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
            <Card.Body>{renderFileViews(fileMetaData)}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileTable;
