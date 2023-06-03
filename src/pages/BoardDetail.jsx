import React from "react";
import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getBoardDetailAxios } from "../apis/board/getBoardDetailAxios";

function BoardDetail() {
  const [currentPosition, setCurrentPosition] = useState(70);
  const formRef = useRef(null);
  const formRangeRef = useRef(null);
  const params = useParams();

  // 스크롤 시 따라다니는 Form
  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      const limitedPosition = Math.max(70, Math.min(125, position));
      setCurrentPosition(limitedPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (formRef.current && formRangeRef.current) {
      // formRef와 formRangeRef가 null이 아닌지 확인
      const formHeight = formRef.current.offsetHeight;
      const formRangeHeight = formRangeRef.current.offsetHeight;
      const maxTopPosition = formRangeHeight - formHeight;
      const limitedTopPosition = Math.max(
        0,
        Math.min(maxTopPosition, currentPosition)
      );
      formRef.current.style.top = `${limitedTopPosition}px`;
    }
  }, [currentPosition]);

  // 서버 통신
  const { isError, isLoading, data } = useQuery(
    ["getBoardDetailAxios", getBoardDetailAxios],
    () => getBoardDetailAxios(params.boardId)
  );

  console.log(data);
  if (isLoading) {
    return null;
  }

  if (isError) {
    return <h1>오류가 발생하였습니다...!</h1>;
  }

  return (
    <Container>
      <FlexContainer>
        <BoardImg img={data.photoUrl} />
        <MainContentContainer>
          <Title>작가 말</Title>
          <MainContentBody>{data.contents}</MainContentBody>

          <Title name="작품">작가 작품</Title>
          <WorksContainer>
            <WorkItem />
            <WorkItem />
            <WorkItem />
            <WorkItem />
            <WorkItem />
            <WorkItem />
            <WorkItem />
            <WorkItem />
            <WorkItem />
          </WorksContainer>
        </MainContentContainer>
      </FlexContainer>

      <StyledForm ref={formRef}>
        <Form>
          <FormBody>
            <Title>서울에서 작업하실 모델 찾아요!</Title>
            <ProfileBox>
              <ProfileImg src={data.profileUrl}></ProfileImg>

              <UserDataBox>
                <UserPostion> {data.role} </UserPostion>
                <UserNickName>{data.nickName}</UserNickName>
              </UserDataBox>
              <ProfileVisitButton>프로필 방문</ProfileVisitButton>
            </ProfileBox>

            <HashTagContainer>
              <HashTag>#김채원</HashTag>
              <HashTag>#르세라핌</HashTag>
            </HashTagContainer>

            <ListTitle>촬영장소</ListTitle>
            <ListContent>서울 서대문구 명지대 1길 18</ListContent>
            <ListTitle>급여 조건</ListTitle>
            <ListContent>별도 협의</ListContent>
            <ListTitle>지원 방법</ListTitle>
            <ListContent>
              채팅 지원, 이메일 지원(khj981116@gmail.com)
            </ListContent>
            <ListTitle>모집 마감일</ListTitle>
            <ListContent>2023.07.03</ListContent>
            <ChatButton>채팅하기</ChatButton>
          </FormBody>
        </Form>
      </StyledForm>

      <FormRange ref={formRangeRef}></FormRange>
    </Container>
  );
}

export default BoardDetail;

const Container = styled.div`
  padding: 20px 150px 20px 150px;
  display: flex;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoardImg = styled.div`
  width: 500px;
  height: 500px;
  background-image: url(${(props) => props.img});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 5px;
`;

const StyledForm = styled.div`
  /* Form styles */
  position: fixed;
  right: 150px;
  transition: top 0.8s ease;
`;

const Form = styled.div`
  width: 500px;
  max-height: calc(
    100vh - 190px
  ); /* Adjust the value (200px) based on your needs */
  overflow-y: auto;
  background-color: #f5f5f5;
  border-radius: 5px;
  margin-left: auto;

  /////////////////

  /* Hide the scrollbar */
  ::-webkit-scrollbar {
    width: 0.8em;
    background-color: #f5f5f5;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #c5c5c5;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #888;
  }
`;

const FormBody = styled.div`
  padding: 30px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-top: ${(props) => (props.name === "작품" ? "100px" : "0px")};
`;

const ProfileBox = styled.div`
  display: flex;
  align-items: center;
  padding-top: 20px;
`;

const ProfileImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 70%;
  object-fit: cover;
`;

const UserDataBox = styled.div`
  padding-left: 10px;
`;

const UserPostion = styled.div`
  color: #777777;
  font-size: 14px;
  padding-bottom: 5px;
`;

const UserNickName = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

const ProfileVisitButton = styled.button`
  margin-left: auto;
  padding: 12px;
  background-color: transparent;
  border: 1px solid #7e7e7e;
  border-radius: 10px;

  &:hover {
    background-color: #8c8c8c;
    border-color: #fff;
    color: #fff;
  }
`;

const HashTagContainer = styled.div`
  margin-top: 20px;
  padding: 10px 0 10px 0;
  display: flex;
  gap: 5px;
`;

const HashTag = styled.div`
  background-color: #1e90ff;
  color: white;
  padding: 5px;
  border-radius: 5px;
`;

const ListTitle = styled.div`
  color: #777777;
  margin-top: 40px;
`;

const ListContent = styled.div`
  margin-top: 20px;
`;

const ChatButton = styled.button`
  width: 100%;
  padding: 20px;
  margin-top: 45px;
  font-size: 17px;
  font-weight: 500;
  background-color: transparent;
  border-radius: 10px;
  border: 1px solid #7e7e7e;
  &:hover {
    background-color: #8c8c8c;
    border-color: #fff;
    color: #fff;
  }
`;

const MainContentContainer = styled.div`
  margin-top: 40px;
`;

const MainContentBody = styled.div`
  margin-top: 20px;
  width: 620px;
`;

const WorksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 10px;
  width: 620px;
`;

const WorkItem = styled.div`
  width: 200px;
  height: 200px;
  background-image: url("/img/profile_12.jpeg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const FormRange = styled.div`
  /* background-color: aqua; */
  width: 10%;
`;