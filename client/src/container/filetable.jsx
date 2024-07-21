import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useState, useEffect } from "react";

import MultiSelect from "../components/multiselect";
import FileView from "../components/fileview";

import testData from "./testdata.json"; 

const FileTable = () => {
  const [queryData, setQueryData] = useState([]);
  const [fileMetaData, setFileMetaData] = useState([]); 
  const [filenameOptions, setFilenameOptions] = useState([]); 
  const [fileExtensionOptions, setFileExtensionOptions] = useState([]); 
  const [fileOwnerOptions, setFileOwnerOptions] = useState([]); 

  const [selectedFilenameOptions, setSelectedFilenameOptions] = useState([]);
  const [selectedFileExtensionOptions, setSelectedFileExtensionOptions] = useState([]);
  const [selectedFileOwnerOptions, setSelectedFileOwnerOptions] = useState([]);

  useEffect(() => {
    setQueryData(testData);
  }, []);

  useEffect(() => {
    setFileMetaData(queryData);

    const uniqueFilenames = [...new Set(queryData.map(file => file.name))].map(name => ({ label: name, value: name }));
    setFilenameOptions(uniqueFilenames);
    
    const uniqueFileExtensions = [...new Set(queryData.map(file => file.extension))].map(extension => ({ label: extension, value: extension }));
    setFileExtensionOptions(uniqueFileExtensions);
    
    const uniqueFileOwners = [...new Set(queryData.map(file => file.owner))].map(owner => ({ label: owner, value: owner }));
    setFileOwnerOptions(uniqueFileOwners);
  }, [queryData]);

  useEffect(() => {
    if (selectedFilenameOptions.length > 0) {
      const filteredData = queryData.filter(file => selectedFilenameOptions.map(option => option.value).includes(file.name));
      setFileMetaData(filteredData);
    }else if (selectedFileExtensionOptions.length > 0) {
      const filteredData = queryData.filter(file => selectedFileExtensionOptions.map(option => option.value).includes(file.extension));
      setFileMetaData(filteredData);
    }else if (selectedFileOwnerOptions.length > 0) {
      const filteredData = queryData.filter(file => selectedFileOwnerOptions.map(option => option.value).includes(file.owner));
      setFileMetaData(filteredData);
    }else {
      setFileMetaData(queryData);
    }
  },[selectedFilenameOptions, selectedFileExtensionOptions, selectedFileOwnerOptions, queryData]);

  const renderFileViews = (data) => {
    return data.map((file, index) => (
      <FileView key={index} file_meta_data={file} />
    ));
  };

  const handleNameSelect = (vData) => {
    setSelectedFilenameOptions(vData);
    setSelectedFileExtensionOptions([]);
    setSelectedFileOwnerOptions([]);
  };

  const handleExtensionSelect = (vData) => {
    setSelectedFileExtensionOptions(vData);
    setSelectedFilenameOptions([]);
    setSelectedFileOwnerOptions([]);
  };

  const handleOwnerSelect = (vData) => {
    setSelectedFileOwnerOptions(vData);
    setSelectedFilenameOptions([]);
    setSelectedFileExtensionOptions([]);
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
        <Col md={1} className="d-flex justify-content-end">
          <Button variant="success" className="btn-md">
            +
          </Button>
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
