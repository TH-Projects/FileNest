import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
 
const MultiSelect = (props) => {
  let options = [...props.options];
  if (props.isMulti) {
    options = [{ label: 'Select All', value: 'all' }, ...options]
  }
 
  return (
    <Select
      components={makeAnimated()}
      isMulti
      autofocus
      onChange={props.onChange}
      placeholder={props.placeholder ? props.placeholder : 'Select...'}
      options={options}
      className="basic-multi-select"
      classNamePrefix="select"
      defaultValue={props.defaultValue}
      defaultInputValue={props.defaultInputValue}
    />
  );
};
 
export default MultiSelect;