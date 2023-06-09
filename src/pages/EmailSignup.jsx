import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Container, TitleLogo, Title } from "../styles/ContainerStyles";
import { InputWrap, Input, InputTitle } from "../styles/InputStyles";
import { useMutation } from "react-query";
import {
  checkEmailAxios,
  sendEmailAxios,
  signupAxios,
} from "../apis/auth/signup";
import Swal from "sweetalert2";
import { AiOutlineEye } from "@react-icons/all-files/ai/AiOutlineEye";
import { AiOutlineEyeInvisible } from "@react-icons/all-files/ai/AiOutlineEyeInvisible";
import TermsofService from "../components/TermsofService";
import ImageCompressor from "browser-image-compression";

function EmailSignup() {
  const navigate = useNavigate();
  const backButtonHandler = () => {
    navigate("/main");
  };

  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickNameErrorMessage, setNickNameMessage] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(false);
  const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] =
    useState(false);
  const [signupActive, setSignupActive] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const nickMaxLength = 8;
  // 이미지 state
  const [profileImg, setProfileImg] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const fileInput = useRef();

  // 이메일 인증 번호 state
  const [code, setCode] = useState("");
  const [isSendEmail, setIsSendEmail] = useState(false);
  const [isemailChecking, setIsEmailChecking] = useState(false);

  const [checkModal, setCheckModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const chechModalClose = () => {
    setCheckModal(false);
  };

  const [passwordType, setPasswordType] = useState({
    type: "password",
    visible: false,
  });
  const [passwordCheckType, setPasswordCheckType] = useState({
    type: "password",
    visible: false,
  });
  const passwordTypeHandler = (e) => {
    setPasswordType(() => {
      if (!passwordType.visible) {
        return { type: "text", visible: true };
      }
      return { type: "password", visible: false };
    });
  };
  const passwordCheckTypeHandler = (e) => {
    setPasswordCheckType(() => {
      if (!passwordCheckType.visible) {
        return { type: "text", visible: true };
      }
      return { type: "password", visible: false };
    });
  };

  const signupMutation = useMutation(signupAxios, {
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "회원가입 완료!",
        text: `Moment에 오신 것을 환영합니다✨
        로그인 후 다양한 서비스를 이용하실 수 있습니다.`,
        confirmButtonText: "확인",
      });
      setNickName("");
      setEmail("");
      setGender("");
      setRole("");
      setPassword("");
      setPasswordCheck("");
      navigate("/login");
    },
    onError: (error) => {
      console.log("에러", error);
      Swal.fire({
        icon: "warning",
        title: "닉네임 중복!",
        text: `중복된 닉네임이 존재합니다! 
        다른 닉네임을 설정해주세요🙏`,
        confirmButtonText: "확인",
      });
    },
  });
  const sendEmailMutation = useMutation(sendEmailAxios, {
    onSuccess: () => {
      setIsSendEmail(true);
      Swal.fire({
        icon: "success",
        title: "인증번호 전송!",
        text: `회원님의 이메일로 인증번호를 전송을 성공했습니다!✨`,
        confirmButtonText: "확인",
      });
    },
    onError: (error) => {
      setIsSendEmail(false);
      if (error.response.data.message === "이미 존재하는 메일입니다.") {
        Swal.fire({
          icon: "error",
          title: "인증번호 전송 실패!",
          text: `이미 가입된 이메일입니다.😥`,
          confirmButtonText: "확인",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "인증번호 전송 실패!",
          confirmButtonText: "확인",
        });
      }
    },
  });

  const checkEmailMutation = useMutation(checkEmailAxios, {
    onSuccess: () => {
      setIsEmailChecking(true);
      Swal.fire({
        icon: "success",
        title: "이메일인증 성공!",
        text: `이메일 인증에 성공하셨습니다!✨`,
        confirmButtonText: "확인",
      });
      setIsEmailVerified(true);
    },
    onError: () => {
      setIsEmailChecking(false);
      Swal.fire({
        icon: "error",
        title: "이메일인증 실패!",
        text: `인증번호를 다시 한 번 확인해보세요!`,
        confirmButtonText: "확인",
      });
    },
  });
  // 이메일, 패스워드 정규식
  const emailRegex =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;
  // 닉네임 에러 메세지
  const nickNameError = useMemo(() => {
    if (nickName.length > 8) {
      setNickNameMessage(true);
      return "닉네임은 8글자를 넘지 않아야합니다.";
    } else {
      return "";
    }
  }, [nickName]);
  const handleNickNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= nickMaxLength) {
      setNickName(value);
    }
  };
  // 이메일 에러 메세지
  const emailError = useMemo(() => {
    if (email && !emailRegex.test(email)) {
      setEmailErrorMessage(true);
      return "이메일의 형식이 올바르지 않습니다.";
    } else {
      return "";
    }
  }, [email]);
  // 패스워드 에러 메세지
  const passwordError = useMemo(() => {
    if (password && !passwordRegex.test(password)) {
      setPasswordErrorMessage(true);
      return "비밀번호는 8~15자의 영문, 숫자 포함 8자리 이상입니다.";
    } else {
      return "";
    }
  }, [password]);
  // 패스워드체크 에러 메세지
  const passwordCheckError = useMemo(() => {
    if (!validatePasswordCheck(password, passwordCheck)) {
      setPasswordCheckErrorMessage(true);
      return "입력하신 비밀번호가 일치하지 않습니다.";
    } else {
      return "";
    }
  }, [passwordCheck]);

  // 성별, 직업 버튼 클릭 핸들러
  const sexButtonClickHandler = useCallback((selectedSex) => {
    setGender(selectedSex);
  }, []);
  const roleButtonClickHandler = useCallback((selectedRole) => {
    setRole(selectedRole);
  }, []);

  // 프로필사진 업로드
  const addPhoto = async (e) => {
    e.preventDefault();
    const imageFile = e.target.files[0];

    const options = {
      maxSizeMB: 1, // 최대 파일 크기(메가바이트 단위)
      maxWidthOrHeight: 1920, // 이미지의 최대 너비 또는 높이 (이미지 비율 유지)
      useWebWorker: true,
      fileType: "webp",
    };
    try {
      const compressedFile = await ImageCompressor(imageFile, options);
      setProfileImg(compressedFile);
    } catch (error) {
      console.log(error);
    }

    // 미리보기
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = () => {
      const previewImgUrl = reader.result;
      setImgUrl(previewImgUrl);
    };
  };

  const MemoizedSelectionButton = React.memo(SelectionButton);
  // password 확인
  function validatePasswordCheck(password, passwordCheck) {
    return password === passwordCheck;
  }
  const signupActiveHandler = () => {
    if (
      !email ||
      !password ||
      !passwordCheck ||
      !nickName ||
      !gender ||
      password !== passwordCheck
    ) {
      setSignupActive(false);
    } else {
      setSignupActive(true);
    }
  };
  // 이메일 서버에 전송
  const emailSendButtonHandler = () => {
    sendEmailMutation.mutate({ email });
  };

  // 이메일 인증번호 확인
  const emailVerifyNumCheckHandler = () => {
    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "인증번호 오류!",
        text: `인증번호를 입력해주세요!`,
        confirmButtonText: "확인",
      });
    } else {
      checkEmailMutation.mutate({ email, code });
    }
  };

  // 회원가입버튼 클릭
  const signupButtonHandler = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("profile", profileImg);

    const signup = {
      nickName,
      gender,
      role,
      password,
      email,
    };
    formData.append(
      "signup",
      new Blob([JSON.stringify(signup)], { type: "application/json" })
    );

    if (signupActive) {
      if (!isChecked) {
        Swal.fire({
          icon: "warning",
          title: "회원가입 실패!",
          text: `모먼트 가입 약관에 동의해주세요✨`,
          confirmButtonText: "확인",
        });
        return;
      }
      if (!isemailChecking) {
        Swal.fire({
          icon: "warning",
          title: "회원가입 실패!",
          text: `이메일 인증을 완료해주세요✨`,
          confirmButtonText: "확인",
        });
        return;
      }
      signupMutation.mutate(formData);
    } else {
      Swal.fire({
        icon: "error",
        title: "회원가입 실패!",
        text: `회원정보를 모두 입력해주세요✨`,
        confirmButtonText: "확인",
      });
    }
  };
  useEffect(() => {
    signupActiveHandler();
  }, [nickName, email, gender, role, password, passwordCheck]);
  return (
    <Container>
      <CenteredContent>
        <TitleLogo>
          <Title>Moment</Title>
          <SubTitle>이메일로 가입하기</SubTitle>
        </TitleLogo>
        <InputTitle>프로필 사진</InputTitle>
        <StImageUpload>
          <StProfile image={imgUrl}>IMAGE</StProfile>
          <UploadButton>
            프로필 사진 추가
            <input
              type="file"
              name="profileImg"
              accept="image/*"
              onChange={addPhoto}
              ref={fileInput}
            ></input>
          </UploadButton>
        </StImageUpload>
        <InputTitle>닉네임</InputTitle>
        <InputWrap>
          <Input
            type="text"
            name="nickname"
            value={nickName || ""}
            placeholder="닉네임을 입력해주세요."
            onChange={handleNickNameChange}
          />
          {nickName.length}/8
        </InputWrap>
        {nickNameErrorMessage && <ErrorMessage>{nickNameError}</ErrorMessage>}
        <InputTitle>포지션</InputTitle>
        <ButtonContainer>
          <MemoizedSelectionButton
            onClick={() => roleButtonClickHandler("MODEL")}
            style={{
              backgroundColor: role === "MODEL" ? "#483767" : "#ffffff",
              color: role === "MODEL" ? "#ffffff" : "#000000",
            }}
          >
            모델
          </MemoizedSelectionButton>
          <MemoizedSelectionButton
            onClick={() => roleButtonClickHandler("PHOTOGRAPHER")}
            style={{
              backgroundColor: role === "PHOTOGRAPHER" ? "#483767" : "#ffffff",
              color: role === "PHOTOGRAPHER" ? "#ffffff" : "#000000",
            }}
          >
            사진작가
          </MemoizedSelectionButton>
        </ButtonContainer>
        <InputTitle>성별</InputTitle>
        <ButtonContainer>
          <MemoizedSelectionButton
            onClick={() => sexButtonClickHandler("MALE")}
            style={{
              backgroundColor: gender === "MALE" ? "#483767" : "#ffffff",
              color: gender === "MALE" ? "#ffffff" : "#000000",
            }}
          >
            남자
          </MemoizedSelectionButton>
          <MemoizedSelectionButton
            onClick={() => sexButtonClickHandler("FEMALE")}
            style={{
              backgroundColor: gender === "FEMALE" ? "#483767" : "#ffffff",
              color: gender === "FEMALE" ? "#ffffff" : "#000000",
            }}
          >
            여자
          </MemoizedSelectionButton>
        </ButtonContainer>
        <InputTitle>이메일</InputTitle>
        <InputGroup>
          <InputWrap>
            <Input
              type="text"
              name="email"
              value={email || ""}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="이메일 주소를 입력해주세요"
              disabled={isEmailVerified}
            />
          </InputWrap>
          <MailCheckButton
            type="button"
            onClick={() => {
              if (isemailChecking) {
                Swal.fire({
                  icon: "warning",
                  title: "이미 이메일 인증을 완료하셨습니다!",
                  confirmButtonText: "확인",
                });
                return;
              }
              emailSendButtonHandler();
            }}
          >
            {isemailChecking ? "인증완료" : "인증번호 전송"}
          </MailCheckButton>
        </InputGroup>
        {emailErrorMessage && <ErrorMessage>{emailError}</ErrorMessage>}
        {/* 이메일 인증번호 입력란 => 이메일을 서버에 성공적으로 보내면 인증번호 입력란이 나게 */}
        {isSendEmail && !isemailChecking && (
          <>
            <InputTitle>인증번호</InputTitle>
            <InputGroup>
              <InputWrap>
                <Input
                  type="text"
                  name="code"
                  value={code || ""}
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                  placeholder="인증번호를 입력해주세요"
                />
              </InputWrap>
              <MailCheckButton
                type="button"
                onClick={emailVerifyNumCheckHandler}
                disabled={isemailChecking}
              >
                {isemailChecking ? "인증완료" : "확인"}
              </MailCheckButton>
            </InputGroup>
          </>
        )}
        <InputTitle>비밀번호</InputTitle>
        <InputWrap>
          <Input
            type={passwordType.type}
            name="password"
            value={password}
            placeholder="비밀번호를 입력해주세요"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <span onClick={passwordTypeHandler}>
            {passwordType.visible ? (
              <AiOutlineEye />
            ) : (
              <AiOutlineEyeInvisible />
            )}
          </span>
        </InputWrap>
        {passwordErrorMessage && <ErrorMessage>{passwordError}</ErrorMessage>}
        <InputTitle>비밀번호 확인</InputTitle>
        <InputWrap>
          <Input
            type={passwordCheckType.type}
            placeholder="비밀번호를 다시 입력해주세요."
            value={passwordCheck}
            onChange={(e) => {
              setPasswordCheck(e.target.value);
            }}
          />
          <span onClick={passwordCheckTypeHandler}>
            {passwordCheckType.visible ? (
              <AiOutlineEye />
            ) : (
              <AiOutlineEyeInvisible />
            )}
          </span>
        </InputWrap>
        {passwordCheckErrorMessage && (
          <ErrorMessage>{passwordCheckError}</ErrorMessage>
        )}
        <CheckContainer>
          <CheckboxLabel>
            <Checkbox type="checkbox" onChange={() => handleCheckboxChange()} />
            <CheckboxText>모먼트 가입 약관에 모두 동의합니다.</CheckboxText>
          </CheckboxLabel>

          <CheckButton
            onClick={() => {
              setCheckModal(true);
            }}
            type="button"
          >
            확인하기
          </CheckButton>
        </CheckContainer>
        {checkModal && <TermsofService chechModalClose={chechModalClose} />}
        <BottomButtonWrap>
          <BottomButton onClick={backButtonHandler}>취소</BottomButton>
          <BottomButton
            type="button"
            onClick={signupButtonHandler}
            bgcolor={signupActive ? "black" : "lightgrey"}
          >
            회원 가입 완료
          </BottomButton>
        </BottomButtonWrap>
      </CenteredContent>
    </Container>
  );
}

export default EmailSignup;

const SubTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const CenteredContent = styled.form`
  flex: 1 0 auto;
  margin: 0px auto;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 40px 0px;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px 0;
  gap: 30px;
`;

const SelectionButton = styled.button`
  background-color: #ffffff;
  width: 145px;
  border-radius: 3px;
  margin-right: 2px;
  color: #000000;
  padding: 10px 40px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid #e2e0e0;

  &:active,
  &:focus {
    background-color: #000000;
    color: white;
  }
`;
const InputGroup = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;
const MailCheckButton = styled.button`
  margin: 0 10px;
  padding: 0 10px;
  width: 20%;
  height: 48px;
  border: none;
  font-weight: 700;
  background-color: #483767;
  border-radius: 64px;
  color: white;
  cursor: pointer;

  &:disabled {
    background-color: #dadada;
    color: white;
  }
`;

const BottomButton = styled.button`
  width: 35%;
  height: 48px;
  border: none;
  font-weight: 700;
  background-color: ${(props) => props.bgcolor || "#000000"};
  border-radius: 64px;
  color: white;
  margin-bottom: 16px;
  cursor: pointer;

  &:disabled {
    background-color: #dadada;
    color: white;
  }
`;
const BottomButtonWrap = styled.div`
  display: flex;
  justify-content: center;
  justify-content: space-evenly;
  margin: 80px 40px;
`;
const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  flex-wrap: warp;
`;
export const StImageUpload = styled.div`
  padding: 3%;
  /*   margin-bottom: 3%; */
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

  input {
    padding-top: 3%;
  }
`;
export const StProfile = styled.div`
  width: 200px;
  line-height: 200px;
  font-size: 0.7rem;
  text-align: center;
  color: #ccc;
  margin: 20px;
  border: 1px solid #ccc;
  border-radius: 50%;
  background: ${(props) => `url(${props.image}) no-repeat 50% /cover`};
`;

const CheckContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CheckButton = styled.button`
  border: none;
  background-color: transparent;
  margin-left: 10px;
  font-size: 15px;
  text-decoration: underline;
  color: #858585;
  &:hover {
    color: #1b1b1b;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: bold;
`;

const CheckboxText = styled.span`
  flex-grow: 1;
`;

const Checkbox = styled.input`
  margin-right: 12px;
`;
const UploadButton = styled.label`
  display: inline-block;
  max-width: fit-content;
  padding: 10px 75px;
  background-color: #ffffff;
  color: #000000;
  border: 1px #acabab solid;
  border-radius: 3px;

  &:hover {
    background-color: #483767;
    color: #ffffff;
  }

  input[type="file"] {
    display: none;
  }
`;
