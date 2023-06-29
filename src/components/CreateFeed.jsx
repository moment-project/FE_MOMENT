import React, { useEffect, useRef, useState } from "react";
import "../css/CreateFeedModal.css";
import disableScroll from "./DisableScroll";
import enableScroll from "./EnableScroll";
import { useInput } from "../hooks/useInput";
import { createFeedAxios } from "../apis/feed/createFeedAxios";
import { useMutation, useQueryClient } from "react-query";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import UserDataComponent from "./UserDataComponent";
import styled from "styled-components";
import Swal from "sweetalert2";
import { RiCheckboxMultipleBlankLine } from "@react-icons/all-files/ri/RiCheckboxMultipleBlankLine";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import imageCompression from "browser-image-compression";

const CreateFeed = (props) => {
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

    if (newHashTag.length > 8) {
      Swal.fire({
        icon: "error",
        // title: "피드 생성 완료!",
        text: `입력한 값은 8자를 초과할 수 없습니다.`,
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
  const [selectedFile, setSelectedFile] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);
  const [uploadToggleBtn, setUploadToggleBtn] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [content, onChangeContentHandler] = useInput();
  const [isSaving, setIsSaving] = useState(false); // 버튼 비활성화
  const modalRef = useRef(null);
  const loginUserData = UserDataComponent();
  const queryClient = useQueryClient();

  const handleFileChange = async (e) => {
    const files = e.target.files;
    const fileArray = Array.from(files);

    const options = {
      maxSizeMB: 1, // 최대 크기 MB
      maxWidthOrHeight: 700, // 최대 너비 또는 높이 1920
      useWebWorker: true,
      // fileType: "webp",
    };
    const compressedFileArray = await Promise.all(
      fileArray.map((file) => imageCompression(file, options))
    );

    setSelectedFile([...selectedFile, ...compressedFileArray]);

    compressedFileArray.forEach((file) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage((prevImages) => [...prevImages, reader.result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDeletePhoto = (index) => {
    setSelectedFile((prevSelectedFile) => {
      const newSelectedFile = [...prevSelectedFile];
      newSelectedFile.splice(index, 1);
      return newSelectedFile;
    });

    setPreviewImage((prevPreviewImage) => {
      const newPreviewImage = [...prevPreviewImage];
      newPreviewImage.splice(index, 1);
      return newPreviewImage;
    });

    // 메인 이미지 인덱스 변경
    setMainImageIndex((index) => index - 1);
  };

  const handleImageClick = (index) => {
    setMainImageIndex(index);
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
  const createFeedMutation = useMutation(createFeedAxios, {
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "포트폴리오 생성 완료!",
        text: `포트폴리오가 생성되었습니다✨`,
        confirmButtonText: "확인",
      });
      close();
      queryClient.invalidateQueries("getFeedAxios");
      queryClient.invalidateQueries("mypage");
    },
    onError: (error) => {
      alert(error);
    },
  });

  // 저장하기 버튼 클릭
  const saveButtonHandler = () => {
    if (!selectedFile || !content || hashTags == []) {
      Swal.fire({
        icon: "error",
        title: "포트폴리오 생성 실패!",
        text: `모든 내용을 입력해주세요🙏`,
        confirmButtonText: "확인",
      });
      return;
    }
    setIsSaving(true);

    const formData = new FormData();
    formData.append("contents", content);
    formData.append(
      "photoHashTag",
      new Blob([JSON.stringify(hashTags)], { type: "application/json" })
    );

    selectedFile.forEach((file) => {
      formData.append("imageFile", file);
    });

    createFeedMutation.mutate(formData);
  };

  useEffect(() => {
    if (createFeedMutation.isSuccess || createFeedMutation.isError) {
      setIsSaving(false);
    }
  }, [createFeedMutation.isSuccess, createFeedMutation.isError]);

  return (
    <div className={open ? "openModal create-feed-modal" : "create-feed-modal"}>
      {open ? (
        <section ref={modalRef}>
          <Header>
            <HeaderTitle>새 포트폴리오 만들기</HeaderTitle>
            <HeaderTitleBox>
              <SaveButton onClick={saveButtonHandler} disabled={isSaving}>
                등록하기
              </SaveButton>
              <CloseButton onClick={close}>
                <AiOutlineClose />
              </CloseButton>
            </HeaderTitleBox>
          </Header>

          <Container>
            <MainBody>
              <ImgContainerBox>
                {previewImage == "" ? (
                  <UploadButton htmlFor="file">
                    파일 업로드하기
                    <input
                      type="file"
                      multiple
                      name="file"
                      id="file"
                      onChange={handleFileChange}
                    />
                  </UploadButton>
                ) : (
                  <PreviewImage
                    src={previewImage[mainImageIndex]}
                    alt="Preview"
                  />
                )}
                {uploadToggleBtn && (
                  <UploadToggleContainer>
                    <ImgContainer>
                      {previewImage !== null &&
                        previewImage.map((item, index) => (
                          <ImgBox
                            key={index}
                            onClick={() => handleImageClick(index)}
                          >
                            <UploadImg img={item}>
                              <DeletePhotoButton
                                onClick={() => {
                                  handleDeletePhoto(index);
                                }}
                              >
                                <AiOutlineClose />
                              </DeletePhotoButton>
                            </UploadImg>
                          </ImgBox>
                        ))}
                      <PlusButton htmlFor="file">
                        <AiOutlinePlus size={"20px"} />
                        <input
                          type="file"
                          multiple
                          name="file"
                          id="file"
                          onChange={handleFileChange}
                        />
                      </PlusButton>
                    </ImgContainer>
                  </UploadToggleContainer>
                )}
                <MultipleUpload
                  onClick={() => {
                    setUploadToggleBtn(!uploadToggleBtn);
                  }}
                >
                  <RiCheckboxMultipleBlankLine size={"25px"} />
                </MultipleUpload>
              </ImgContainerBox>
            </MainBody>

            <InputSection>
              <ProfileBox>
                <ProfileImg src={loginUserData.profileImg} alt="프로필이미지" />
                <div>
                  <Position>{loginUserData.role}</Position>
                  <p>{loginUserData.nickName}</p>
                </div>
              </ProfileBox>
              <InputTextArea
                placeholder="문구 입력..."
                value={content}
                onChange={onChangeContentHandler}
                maxLength={100}
              ></InputTextArea>

              <HashTageContainer>
                <HashTagInputTitle>해시태그</HashTagInputTitle>
                <HashTagGuide>8자 이내, 해시태그 개수 3개 제한</HashTagGuide>
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
                    maxLength={8}
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

export default CreateFeed;

const HashTageContainer = styled.div`
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

const Tag = styled.div`
  display: inline-flex;
  flex-direction: row;
  background: #483767;
  color: white;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #483767;
  }
`;

const CloseButton = styled.button`
  margin-top: 3px;
  background-color: transparent;
`;

const HashTagGuide = styled.div`
  color: #787878;
  font-size: 13px;
  margin-left: 5px;
`;

const HashTagInput = styled.input`
  outline: none;
  border: none;
  font-size: 16px;
  width: 100%;
  margin-top: 10px;
`;

const HashTagInputTitle = styled.div`
  padding-bottom: 10px;
  padding-left: 6px;
`;

const MultipleUpload = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0 20px 28px 0;
  padding: 7px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(58, 58, 58, 0.5);
  color: white;
`;

const UploadToggleContainer = styled.div`
  display: flex;
  position: absolute;
  background-color: rgba(22, 22, 22, 0.7);
  bottom: 0;
  margin-bottom: 90px;
  right: 0;
  margin-right: 20px;
  padding: 15px;
  border-radius: 5px;
`;

const ImgContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const ImgBox = styled.div`
  width: 100px;
  height: 100px;
  cursor: pointer;
`;

const UploadImg = styled.div`
  position: relative;
  height: 100%;
  background-position: center;
  background-size: cover;
  background-image: ${(props) => `url(${props.img})`};
`;

const PlusButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 5px;
  width: 40px;
  height: 40px;
  background-color: transparent;
  color: white;
  border: 1px solid white;
  cursor: pointer;
`;

const DeletePhotoButton = styled.button`
  padding: 5px;
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(58, 58, 58, 0.5);
  border-radius: 50%;
  width: 25px;
  height: 25px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #eee;
`;

const HeaderTitle = styled.div`
  padding: 5px;
  margin-left: 6px;
`;

const HeaderTitleBox = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  margin: 0 10px 0 auto;
`;

const SaveButton = styled.div`
  padding: 5px;
  background-color: transparent;
  font-weight: 600;
  font-size: 13.333px;
  cursor: pointer;
`;

const Container = styled.div`
  display: flex;
`;

const MainBody = styled.div`
  display: flex;
  min-height: 700px;
  max-height: 700px;
  overflow: hidden;
  background-color: #eee;
`;

const ImgContainerBox = styled.div`
  width: 720px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadButton = styled.label`
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

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
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
`;

const Position = styled.p`
  color: #787878;
  margin-bottom: 5px;
`;

const InputTextArea = styled.textarea`
  margin-left: 5px;
  width: 98%;
  height: 50%;
  padding: 10px;
  border-radius: 5px;
  font-size: 18px;
  font-weight: 500;
  resize: none;
  border: none;
  outline: none;
`;
