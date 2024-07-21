/* eslint-disable react/prop-types */
import Select from "react-select";
import makeAnimated from "react-select/animated";

const MultiSelect = (props) => {
  let options = [...props.options];

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: "black",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "black",
    }),
  };

  return (
    <Select
      components={makeAnimated()}
      isMulti={props.isMulti}
      autoFocus={props.autoFocus}
      onChange={props.onChange}
      placeholder={props.placeholder ? props.placeholder : "Select..."}
      options={options}
      value={props.value}
      className="basic-multi-select"
      classNamePrefix="select"
      defaultValue={props.defaultValue}
      defaultInputValue={props.defaultInputValue}
      styles={customStyles}
    />
  );
};

export default MultiSelect;
