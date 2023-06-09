import React from "react";
import styled from "styled-components";
import BoardItem from "../components/BoardItem";
import { mypage } from "../apis/mypage/mypage";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import MyPageTabs from "../components/MyPageTabs";
import MyPageProfile from "../components/MyPageProfile";
import LoadingSpinner from "../components/LoadingSpinner";
import FeedDetail from "../components/FeedDetail";
import { useState } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const MyPage = () => {
  const navigate = useNavigate();
  const { hostId } = useParams();

  const userId = useSelector((state) => state.user.userId);
  const mine = hostId == userId;

  const { isError, isLoading, data, error } = useQuery(
    ["mypage", hostId],
    () => mypage(hostId),
    {
      enabled: hostId !== undefined,
    }
  );

  // 모달 제어
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [feedDetailOpen, setFeedDetailOpen] = useState([]);

  const openFeedDetail = (photoId) => {
    if (isLoggedIn) {
      setFeedDetailOpen((prevOpen) => [...prevOpen, photoId]);
    } else {
      Swal.fire({
        icon: "warning",
        title: "회원 전용 서비스!",
        text: `로그인이 필요한 서비스입니다🙏`,
        confirmButtonText: "확인",
      });
    }
  };

  const closeFeedDetail = (photoId) => {
    setFeedDetailOpen((prevOpen) => prevOpen.filter((id) => id !== photoId));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    if (error.response.request.status === 401) {
      Swal.fire({
        icon: "error",
        title: "로그인이후 이용가능한 페이지입니다!",
        confirmButtonText: "확인",
      }).then(() => {
        navigate("/");
      });
    }
    return null;
  }

  return (
    <>
      {mine && <MyPageTabs pageName={"전체보기"} />}
      <PageContainer>
        <ContentContainer>
          <ProfileContainer>
            <MyPageProfile />
          </ProfileContainer>
          <Container>
            <WorkSection>
              <Work>
                {mine ? "나의 포트폴리오" : `${data.nickName}'s 포트폴리오`}
              </Work>
              {(!data.photoList || data.photoList.length === 0) && (
                <EmptyChatList>
                  <p>포트폴리오 목록이 없습니다. 포트폴리오를 생성해보세요!</p>
                </EmptyChatList>
              )}
              <WorkList>
                {data.photoList.slice(0, 6).map((item, index) => {
                  const isOpen = feedDetailOpen.includes(item.photoId);
                  return (
                    <React.Fragment key={index}>
                      <WorkItem
                        src={item.photoUrl}
                        onClick={() => {
                          openFeedDetail(item.photoId);
                        }}
                      />
                      {isOpen && (
                        <FeedDetail
                          open={() => openFeedDetail(item.photoId)}
                          close={() => closeFeedDetail(item.photoId)}
                          photoId={item.photoId}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </WorkList>
            </WorkSection>

            <Content>
              <Work>{mine ? "내 게시물" : `${data.nickName}'s 게시물`}</Work>
              {(!data.boardList || data.boardList.length === 0) && (
                <EmptyChatList>
                  <p>게시물 목록이 없습니다. 게시물을 생성해보세요!</p>
                </EmptyChatList>
              )}
              <BoardList>
                {data.boardList.slice(0, 3).map((item) => {
                  return (
                    <BoardItem
                      key={item.boardId}
                      item={item}
                      onClick={() => {
                        navigate(`/board/${item.boardId}`);
                      }}
                      hover="no"
                    />
                  );
                })}
              </BoardList>
            </Content>
          </Container>
        </ContentContainer>
      </PageContainer>
    </>
  );
};

export default MyPage;

const EmptyChatList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;

  p {
    font-size: 18px;
    font-weight: bold;
    color: #333333;
  }
`;

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
`;

const ProfileContainer = styled.div`
  width: 90%;
  margin-bottom: 30px;

  @media (min-width: 769px) {
    width: 550px;
    margin-bottom: 0;
    margin-right: 30px;
  }
`;

const Container = styled.div`
  width: 100%;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1200px;
  margin-top: 40px;
  @media (min-width: 769px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const BoardList = styled.div`
  display: grid;
  /* grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); */
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const WorkSection = styled.div`
  flex-grow: 1;
`;

const Work = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const WorkList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  justify-items: center;
  align-items: center;
  margin-top: 16px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const WorkItem = styled.div`
  cursor: pointer;
  width: 100%;
  padding-top: 100%;
  border-radius: 7px;
  background-image: ${(props) => `url(${props.src})`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  @media (max-width: 480px) {
    height: 200px;
  }
`;
const Content = styled.div`
  flex-grow: 1;
  margin-top: 50px;
`;
