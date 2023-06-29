import React, { useEffect, useRef, useState } from "react";
import "../css/CreateBoardModal.css";
import disableScroll from "./DisableScroll";
import enableScroll from "./EnableScroll";
import styled from "styled-components";
import { useInput } from "../hooks/useInput";
import { createBoardAxios } from "../apis/board/createBoard";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import UserDataComponent from "./UserDataComponent";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

const CreateBoard = (props) => {
  // 해시태그 기능
  const [inputHashTag, setInputHashTag] = useState("");
  const [hashTags, setHashTags] = useState([]);

  const isEmptyValue = (value) => {
    if (!value.length) {
      return true;
    }
    return false;
  };

  const addHashTag = (e) => {
    const allowedCommand = ["Enter"];
    if (!allowedCommand.includes(e.code)) return;

    if (isEmptyValue(e.target.value)) {
      return setInputHashTag("");
    }

    let newHashTag = e.target.value;
    const regExp = /[\{\}\[\]\/?.;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    // if (regExp.test(newHashTag)) {
    //   newHashTag = newHashTag.replace(regExp, "");
    // }
    if (newHashTag.includes(",")) {
      newHashTag = newHashTag.split(",").join("");
    }

    if (isEmptyValue(newHashTag)) return;

    if (hashTags.length >= 3) return;

    if (newHashTag.length > 10) {
      Swal.fire({
        icon: "error",
        // title: "피드 생성 완료!",
        text: `입력한 값은 10자를 초과할 수 없습니다.`,
        confirmButtonText: "확인",
      });
      return;
    }

    if (!newHashTag.startsWith("#")) {
      newHashTag = `#${newHashTag}`;
    }

    setHashTags((prevHashTags) => {
      return [...new Set([...prevHashTags, newHashTag])];
    });

    setInputHashTag("");
  };

  const removeHashTag = (tag) => {
    setHashTags((prevHashTags) =>
      prevHashTags.filter((hashTag) => hashTag !== tag)
    );
  };

  const keyDownHandler = (e) => {
    if (e.code !== "Enter" && e.code !== "NumpadEnter") return;
    // e.preventDefault();

    const regExp = /^[a-z|A-Z|가-힣|ㄱ-ㅎ|ㅏ-ㅣ|0-9| \t|]+$/g;
    // if (!regExp.test(e.target.value)) {
    //   setInputHashTag("");
    // }
  };

  const changeHashTagInput = (e) => {
    setInputHashTag(e.target.value);
  };

  const { open, close } = props;
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [title, onChangeTitleHandler] = useInput("");
  const [content, onChangeContentHandler] = useInput("");
  const [location, onChangeLocationHandler] = useInput("");
  const [pay, onChangePayHandler] = useInput("");
  const [apply, onChangeApplyHandler] = useInput("");
  const [deadLine, onChangeDeadLineHandler] = useInput("");
  const loginUserData = UserDataComponent(); // 나의 유저 데이터 받아오는 코드
  const queryClient = useQueryClient();

  // 오늘 날짜
  const today = new Date();
  const year = today.getFullYear();
  const month = ("0" + (today.getMonth() + 1)).slice(-2);
  const day = ("0" + today.getDate()).slice(-2);
  const dateString = year + "-" + month + "-" + day;

  // 이미지 미리보기, 압축
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 700,
      useWebWorker: true, // 웹 워커 사용
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setSelectedFile(compressedFile);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error(error);
    }
  };

  // 모달창 바깥을 눌렀을 때 모달 close
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
    }
  };

  // 스크롤 방지
  useEffect(() => {
    disableScroll();
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      enableScroll();
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // 서버 통신
  const createBoardMutation = useMutation(createBoardAxios, {
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "게시물 생성 완료!",
        text: `게시글 생성이 완료됐습니다✨`,
        confirmButtonText: "확인",
      });
      close();
      queryClient.invalidateQueries("getBoard");
      queryClient.invalidateQueries("mypage");
    },
    onError: (error) => {
      alert(error);
    },
  });

  // 저장하기 버튼 클릭
  const saveButtonHandler = () => {
    if (!selectedFile || !location || !pay || !apply || !deadLine || !title) {
      Swal.fire({
        icon: "error",
        title: "게시물 생성 실패!",
        text: `모든 내용을 입력해주세요🙏`,
        confirmButtonText: "확인",
      });
      return;
    }

    const formData = new FormData();

    const boardRequestDto = {
      title,
      content,
      location,
      pay,
      apply,
      deadLine,
      boardHashTag: hashTags,
    };

    formData.append(
      "boardRequestDto",
      new Blob([JSON.stringify(boardRequestDto)], { type: "application/json" })
    );

    formData.append("boardImg", selectedFile);

    createBoardMutation.mutate(formData);
  };

  return (
    <div
      className={open ? "openModal create-board-modal" : "create-board-modal"}
    >
      {open ? (
        <section ref={modalRef}>
          <Header>
            <HeaderTitle>새 게시글 만들기</HeaderTitle>
            <HeaderRightBox>
              <SaveButton onClick={saveButtonHandler}>등록하기</SaveButton>
              <CloseButton onClick={close}>
                <AiOutlineClose />
              </CloseButton>
            </HeaderRightBox>
          </Header>

          <Container>
            <MainBody>
              <ImgContainer>
                {!previewImage ? (
                  <ButtonLabel htmlFor="file">
                    파일 업로드하기
                    <input
                      type="file"
                      name="file"
                      id="file"
                      onChange={handleFileChange}
                    />
                  </ButtonLabel>
                ) : (
                  <ImgBox src={previewImage} alt="Preview" />
                )}
              </ImgContainer>
            </MainBody>

            <InputSection>
              <ProfileBox>
                <ProfileImg src={loginUserData.profileImg} alt="프로필이미지" />
                <div>
                  <Position>{loginUserData.role}</Position>
                  <p>{loginUserData.nickName}</p>
                </div>
              </ProfileBox>
              <ContentContainer>
                <InputTitle>제목</InputTitle>
                <ContentInput
                  placeholder="제목을 입력해주세요"
                  value={title}
                  onChange={onChangeTitleHandler}
                ></ContentInput>

                <InputTitle>내용</InputTitle>
                <ContentInput
                  placeholder="내용을 입력해주세요"
                  value={content}
                  onChange={onChangeContentHandler}
                ></ContentInput>
                <InputTitle>촬영 장소</InputTitle>
                <ContentInput
                  placeholder="장소를 입력해주세요"
                  value={location}
                  onChange={onChangeLocationHandler}
                />

                <InputTitle>페이</InputTitle>
                <ContentInput
                  placeholder="페이 조건을 입력해주세요"
                  value={pay}
                  onChange={onChangePayHandler}
                />

                <InputTitle>지원 방법</InputTitle>
                <ContentInput
                  placeholder="지원 방법을 입력해주세요"
                  value={apply}
                  onChange={onChangeApplyHandler}
                />

                <InputTitle>모집 마감일</InputTitle>
                <ContentInput
                  type="date"
                  value={deadLine}
                  onChange={onChangeDeadLineHandler}
                  min={dateString}
                />
              </ContentContainer>

              <HashTageContainer>
                <HashTagInputTitle>해시태그</HashTagInputTitle>
                <HashTagGuide>10자 이내, 해시태그 개수 3개 제한</HashTagGuide>
                <HashTag>
                  {hashTags.map((hashTag) => (
                    <Tag key={hashTag} onClick={() => removeHashTag(hashTag)}>
                      {hashTag}
                    </Tag>
                  ))}

                  <HashTagInput
                    value={inputHashTag}
                    onChange={changeHashTagInput}
                    onKeyUp={addHashTag}
                    onKeyDown={keyDownHandler}
                    placeholder="#Enter를 눌러 해시태그를 등록해보세요."
                  />
                </HashTag>
              </HashTageContainer>
            </InputSection>
          </Container>
        </section>
      ) : null}
    </div>
  );
};

export default CreateBoard;

const HashTageContainer = styled.div`
  margin-top: 20px;
  margin-left: 5px;
`;

const HashTag = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  width: 320px;
  border: 2px solid $GRAY;
  border-radius: 10px;
  padding: 5px;
  gap: 5px;
  margin-top: 10px;
`;

const ImgBox = styled.img`
  position: relative;
  width: 720px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: contain;
`;

const ContentContainer = styled.div`
  margin-top: -15px;
`;

const HashTagGuide = styled.div`
  color: #787878;
  font-size: 13px;
  margin-left: 10px;
`;

const CloseButton = styled.button`
  margin: 3px 5px 0 0;
  background-color: transparent;
`;

const Tag = styled.div`
  display: inline-flex;
  flex-direction: row;
  background: #483767;
  color: white;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #5f5374;
  }
`;

const HashTagInput = styled.input`
  outline: none;
  border: none;
  font-size: 16px;
  padding: 5px;
  width: 100%;
`;

const InputTitle = styled.div`
  margin: 20px 0px 0px 15px;
`;

const HashTagInputTitle = styled.div`
  padding-bottom: 10px;
  padding-left: 10px;
`;

const ContentInput = styled.input`
  height: 30px;
  width: 94%;
  margin: 6px 0px 0px 15px;
  border: none;
  outline: none;
  font-size: 15px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  padding: 5px;
  border-bottom: 1px solid #eee;
`;

const HeaderTitle = styled.div`
  padding: 5px;
  margin-left: 3px;
  color: black;
`;

const HeaderRightBox = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
`;

const SaveButton = styled.button`
  padding: 5px;
  background-color: transparent;
  font-weight: 600;
  margin-left: auto;
`;

const Container = styled.div`
  display: flex;
`;

const MainBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 700px;
  max-height: 700px;
  overflow: hidden;
  background-color: #eee;
`;

const ImgContainer = styled.div`
  position: relative;
  width: 720px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InputSection = styled.div`
  min-width: 350px;
  min-height: 700px;
  padding: 10px;
`;

const ProfileBox = styled.div`
  display: flex;
  align-items: center;
  color: black;
`;

const ProfileImg = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 70%;
  object-fit: cover;
  padding: 15px;
  flex-shrink: 0;
  cursor: pointer;
`;

const Position = styled.p`
  color: #787878;
`;

const ButtonLabel = styled.label`
  width: 150px;
  height: 30px;
  background: #483767;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  &:hover {
    background: #5f5374;
    color: #fff;
  }

  input {
    display: none; // input 태그를 숨깁니다
  }
`;
