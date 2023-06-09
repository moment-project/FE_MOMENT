import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import MyPageTabs from "../components/MyPageTabs";
import BoardItem from "../components/BoardItem";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { mypage, mypageBoardDelete } from "../apis/mypage/mypage";
import MyPageProfile from "../components/MyPageProfile";
import LoadingSpinner from "../components/LoadingSpinner";
import Swal from "sweetalert2";
import EditBoard from "../components/EditBoard";
import FollowModal from "../components/MatchingList";
import getAcceptList from "../apis/matching/getAcceptList";
import getApplyList from "../apis/matching/getApplyList";
import { BiUser } from "@react-icons/all-files/bi/BiUser";

function Matching() {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [buttonActiveControl, setButtonActiveControl] = useState("accept");
  const [clickedBoardId, setClickedBoardId] = useState();

  // 모달 제어
  const showFollow = () => {
    setShowFollowModal(!showFollowModal);
  };

  const [editButtons, setEditButtons] = useState([]);
  const toggleWriteMenuRef = useRef(null);

  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const openBoardModal = () => {
    setBoardModalOpen(true);
  };

  /* Delete 서버 */
  const deleteMutation = useMutation(mypageBoardDelete, {
    onSuccess: () => {
      queryClient.invalidateQueries(["mypage", mypage]);
      setEditButtons([]);
      Swal.fire({
        icon: "success",
        title: "게시물 삭제!",
        text: `게시물이 정상적으로 삭제되었습니다✨`,
        confirmButtonText: "확인",
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  /* 삭제, 수정 버튼 */
  const editButtonHandler = (boardId) => {
    setSelectedBoardId(boardId);
    openBoardModal();
  };
  const deleteButtonHandler = (boardId) => {
    try {
      Swal.fire({
        title: "정말로 삭제 하시겠습니까?",
        text: "다시 되돌릴 수 없습니다. 신중하세요.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#483767",
        cancelButtonColor: "#c4c4c4",
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteMutation.mutateAsync(boardId);
            toggleButtonClose(boardId);
            Swal.fire({
              title: "삭제가 완료되었습니다✨",
              icon: "success",
              confirmButtonColor: "#483767",
              confirmButtonText: "완료",
            });
          } catch (error) {
            Swal.fire({
              title: "삭제 실패!",
              text: "게시물 삭제 중 오류가 발생했습니다.",
              icon: "error",
              confirmButtonColor: "#483767",
              confirmButtonText: "확인",
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        toggleWriteMenuRef.current &&
        !toggleWriteMenuRef.current.contains(event.target)
      ) {
        setEditButtons([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* 토글버튼 */
  const toggleButtonOpen = (index) => {
    const updatedEditButtons = [...editButtons];
    updatedEditButtons[index] = true;
    setEditButtons(updatedEditButtons);
  };

  const toggleButtonClose = (index) => {
    const updatedEditButtons = [...editButtons];
    updatedEditButtons[index] = false;
    setEditButtons(updatedEditButtons);
  };

  const {
    isError: isErrorAcceptList,
    isLoading: isLoadingAcceptList,
    data: acceptListData,
  } = useQuery("getAcceptList", getAcceptList, {
    onError: (error) => {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "로그인이후 이용가능한 페이지입니다!",
          confirmButtonText: "확인",
        }).then(() => {
          navigate("/");
        });
      }
    },
  });

  const {
    isError: isErrorApplyList,
    isLoading: isLoadingApplyList,
    data: applyListData,
  } = useQuery("getApplyList", getApplyList, {
    onError: (error) => {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "로그인이후 이용가능한 페이지입니다!",
          confirmButtonText: "확인",
        }).then(() => {
          navigate("/");
        });
      }
    },
  });

  if (isLoadingAcceptList || isLoadingApplyList) {
    return <LoadingSpinner />;
  }

  if (isErrorAcceptList || isErrorApplyList) {
    return <h1>오류(⊙ˍ⊙)</h1>;
  }

  return (
    <>
      <MyPageTabs pageName={"매칭목록"} />
      <PageContainer>
        <ContentContainer>
          <ProfileContainer>
            <MyPageProfile />
          </ProfileContainer>

          <Container>
            <Content>
              <MatchingTabBar>
                <MatchingTabButton
                  className={buttonActiveControl === "accept" ? "active" : ""}
                  onClick={() => setButtonActiveControl("accept")}
                >
                  <ButtonContentContainer>
                    <p>내가 받은 매칭 신청</p>
                    <p>{acceptListData.totalCnt}</p>
                  </ButtonContentContainer>
                </MatchingTabButton>
                <MatchingTabButton
                  className={
                    buttonActiveControl === "application" ? "active" : ""
                  }
                  onClick={() => setButtonActiveControl("application")}
                >
                  <ButtonContentContainer>
                    <p>내가 신청한 매칭</p>
                    <p>{applyListData.totalCnt}</p>
                  </ButtonContentContainer>
                </MatchingTabButton>
              </MatchingTabBar>
              <BoardList>
                {buttonActiveControl === "accept"
                  ? acceptListData.matchingBoardResponseDtoList.map((item) => {
                      return (
                        <BoardItemContainer key={item.boardId}>
                          <BoardItem
                            key={item.boardId}
                            item={item}
                            onClick={() => {
                              navigate(`/board/${item.boardId}`);
                            }}
                            photograhperInfoShow="no"
                            showFollow={showFollow}
                            hover="no"
                          >
                            {item.matching && item.whoMatch ? (
                              <MatchingStatusBox
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/page/${item.whoMatchId}`);
                                }}
                              >
                                <p>
                                  {item.whoMatch} 님과 매칭이 완료되었습니다!
                                </p>
                              </MatchingStatusBox>
                            ) : (
                              <MatchingAcceptButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showFollow(true);
                                  setClickedBoardId(item.boardId);
                                }}
                              >
                                <MatchingCount>
                                  <BiUser />
                                  <p>{item.totalApplicantCnt}/5</p>
                                </MatchingCount>
                                <p>매칭 수락</p>
                              </MatchingAcceptButton>
                            )}
                          </BoardItem>
                        </BoardItemContainer>
                      );
                    })
                  : applyListData.matchingApplyBoardResponseDtoList.map(
                      (item) => {
                        return (
                          <BoardItemContainer key={item.boardId}>
                            <BoardItem
                              key={item.boardId}
                              item={item}
                              onClick={() => {
                                navigate(`/board/${item.boardId}`);
                              }}
                              showFollow={showFollow}
                              MatchingStatus="on"
                              hover="no"
                            />
                          </BoardItemContainer>
                        );
                      }
                    )}
              </BoardList>
            </Content>
            {showFollowModal && (
              <FollowModal showFollow={showFollow} boardId={clickedBoardId} />
            )}
          </Container>
        </ContentContainer>
      </PageContainer>
    </>
  );
}

export default Matching;

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
  width: 550px;
`;
const Container = styled.div`
  width: 100%;
`;
const MatchingTabBar = styled.div`
  width: 100%;
  background-color: #eee;
  border: none;
  border-radius: 5px;
  padding: 2px;
  display: flex;
`;

const ButtonContentContainer = styled.div`
  display: flex;
  gap: 10px;
  width: fit-content;
  margin: auto;
`;

const MatchingStatusBox = styled.button`
  width: 84%;
  background-color: #8d18aa;
  color: white;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 6px;
  position: absolute;
  bottom: 0;
  left: 50%;
  font-size: 14px;
  margin-bottom: 10px;
  transform: translateX(-50%);
  text-align: center;
  padding: 9px;
  cursor: pointer;

  &:hover {
    background-color: #8c8c8c;
    border-color: #fff;
    color: #fff;
  }
`;

const MatchingTabButton = styled.button`
  width: 50%;
  padding: 10px;
  /* background-color: #ffffff; */
  /* border: 0.5px solid #a7a7a7; */
  /* background-color: ${(props) =>
    props.active === "on" ? "#ffffff" : "null"}; */
  border: none;
  border-radius: 5px;
  font-size: 15px;

  &.active {
    background-color: #ffffff;
  }
`;

const MatchingCount = styled.div`
  display: flex;
  margin-right: 10px;
  align-items: center;
`;

const MatchingAcceptButton = styled.button`
  margin: auto;
  padding: 9px;
  width: 90%;
  background-color: #483767;
  color: white;
  border: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #8c8c8c;
    border-color: #fff;
    color: #fff;
  }
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

const MatchingButton = styled.div`
  position: absolute;
  bottom: 0;

  background-color: ${(props) =>
    props.matchingStatus === "신청 대기 중" ? "#696969" : "#483767"};
  padding: 8px;
  border-radius: 7px;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #8c8c8c;
    border-color: #fff;
    color: #fff;
  }
`;

const BoardList = styled.div`
  display: grid;
  /* grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); */
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const MatchingCountBox = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0 8px 3px 0;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const Work = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Content = styled.div`
  flex-grow: 1;
  margin-left: 1rem;
`;

const ToggleWriteMenu = styled.div`
  position: absolute;
  top: 68px;
  right: -100px;
  transform: translate(-50%, -50%);
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    top: 105px;
    right: 120px;
  }
`;
const BoardItemContainer = styled.div`
  position: relative;
`;

const EditButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 900;
  padding: 3px;
  z-index: 1;
`;
const Button = styled.button`
  width: 100px;
  margin-left: 58px;
  padding: 8px;
  margin-bottom: 4px;
  background-color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 900;
  z-index: 10;
`;
