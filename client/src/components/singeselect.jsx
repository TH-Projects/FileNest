import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
 
const SingleSelect = (props) =>
  (
    <Select
      components={makeAnimated()}
      autofocus
      value={props.value ? props.value : null}
      defaultValue={props.defaultValue}
      defaultInputValue={props.defaultInputValue}
      onChange={props.onChange}
      placeholder={props.placeholder ? props.placeholder : 'Select...'}
      options={props.options}
      className="basic-multi-select"
      classNamePrefix="select"
    />
  );
 
export default SingleSelect;