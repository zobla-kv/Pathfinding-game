import styled from "styled-components";

export const Wrapper = styled.div`
  opacity: ${(props) => props.opacity};
`;

export const Header = styled.div`
  border-top: 2px solid blue;
  border-bottom: 2px solid blue;
  position: relative;
  margin-top: 8vw;
  text-align: center;
  font-size: 60px;
`;

export const Options = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 20vh;
  padding: 0 10px 0 10px;

  @media (max-width: 1000px) {
    width: 90%;
    margin: 10% auto;
  }

  @media (max-width: 560px) {
    padding: 0;
  }
`;

export const Option = styled.div`
  width: 250px;
  margin-bottom: 40px;
  text-align: center;
  font-size: 25px;

  @media (max-width: 560px) {
    margin: auto;
    margin-bottom: 30px;
  }
`;

export const OptionHeader = styled.div`
  margin-bottom: 10px;
  border-bottom: 1px solid blue;
`;

export const Algorithm = styled.div`
  margin-bottom: 5px;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  line-height: 30px;
  padding-left: 10px;
`;

export const Add = styled.span`
  color: green;
  font-size: 25px;
  font-weight: bold;

  &:hover {
    cursor: pointer;
    color: white;
  }
`;

export const Remove = styled.span`
  color: Red;
  font-size: 25px;
  font-weight: bold;
  position: relative;
  left: -15px;
  &:hover {
    cursor: pointer;
    color: white;
  }
`;

export const NoAlg = styled.span`
  font-size: 16px;
`;

export const Label = styled.label`
  font-size: 16px;
  position: relative;
  top: ${(props) => (props.moveTop ? "-22px" : "-10px")};
`;

export const Input = styled.input`
  position: relative;
  top: ${(props) => (props.moveTop ? "-30px" : "-18px")};
  border-radius: 8px;
  outline: none;
  border-color: white;
  width: 80%;
  height: 18px;
`;

export const Button = styled.button`
  height: 40px;
  width: 150px;
  margin-top: 20%;
  outline: none;
  background-color: blue;
  border-radius: 18px;
  border: 1px solid #337fed;
  cursor: pointer;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  &:hover {
    cursor: pointer;
    border: 2px solid white;
  }

  @media (max-width: 833px) {
    margin-top: 0;
  }

  @media (max-width: 560px) {
    width: 80%;
  }
`;

export const Warning = styled.span`
  color: red;
  font-size: 14px;
`;
