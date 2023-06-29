import React, {
  Suspense,
  lazy,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import styled from "styled-components";
import { getBoard } from "../apis/create/getBoard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/LoadingSpinner";
import { useInfiniteQuery, useMutation } from "react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { GrSearch } from "@react-icons/all-files/gr/GrSearch";
import { searchBoardAxios } from "../apis/board/searchBoard";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { debounce, throttle } from "lodash";
const BoardItem = lazy(() => import("../components/BoardItem"));

function Board() {
  const navigate = useNavigate();
  const [activeNavItem, setActiveNavItem] = useState("Model");
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  let optArr = ["제목", "닉네임", "장소", "해시태그"];
  const [currentOpt, setCurrentOpt] = useState("제목");
  const [showList, setShowList] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [option, setOption] = useState("title");
  const [showButton, setShowButton] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const toggleShowList = () => setShowList(true);
  const toggleCloseList = () => setShowList(false);
  const optionChangeHandler = useCallback((currentOpt) => {
    if (currentOpt === "제목") {
      setOption("title");
    } else if (currentOpt === "해시태그") {
      setOption("keyWord");
    } else if (currentOpt === "닉네임") {
      setOption("userNickName");
    } else if (currentOpt === "장소") {
      setOption("location");
    }
  }, []);
  const liClickHandler = useCallback(
    (index) => {
      setCurrentOpt(optArr[index]);
      optionChangeHandler(optArr[index]);
      toggleCloseList();
    },
    [optionChangeHandler, optArr]
  );

  const selectWrapRef = useRef();
  useEffect(() => {
    const clickListOutside = (e) => {
      if (selectWrapRef.current && !selectWrapRef.current.contains(e.target)) {
        toggleCloseList();
      }
    };
    document.addEventListener("mousedown", clickListOutside);
    return () => {
      document.removeEventListener("mousedown", clickListOutside);
    };
  }, []);

  const searchMutation = useMutation(searchBoardAxios, {
    onSuccess: (response) => {
      if (response.data.empty === true) {
        setIsEmpty(true);
        Swal.fire({
          icon: "warning",
          title: "검색결과가 없습니다!",
          confirmButtonText: "확인",
        });
      }
      setSearchResults(response.data.content);
      setKeyword("");
    },
    onError: () => {
      Swal.fire({
        icon: "warning",
        title: "검색결과가 없습니다!",
        confirmButtonText: "확인",
      });
    },
  });
  const searchButtonClickHandler = useMemo(
    () =>
      debounce(() => {
        if (keyword.trim() === "") {
          setSearchResults([]);
          return;
        }
        const role = activeNavItem.toUpperCase();
        searchMutation.mutate({ keyword, option, role });
      }, 500),
    [keyword, activeNavItem, option, searchMutation]
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchButtonClickHandler();
    }
  };

  const handleNavItemClick = useCallback((item) => {
    setActiveNavItem(item);
    setSearchResults([]);
  }, []);
  const handleScrollThrottled = useCallback(
    throttle(() => {
      const { scrollY } = window;
      scrollY > 200 ? setShowButton(true) : setShowButton(false);
    }, 300),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScrollThrottled);
    return () => {
      window.removeEventListener("scroll", handleScrollThrottled);
    };
  }, [handleScrollThrottled]);

  const { isLoading, isError, data, fetchNextPage } = useInfiniteQuery(
    ["getBoard", activeNavItem],
    ({ pageParam = 0 }) => getBoard({ pageParam, activeNavItem }),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.last === true) {
          return;
        } else {
          return lastPage.number + 1;
        }
      },
    }
  );

  const [bottomObserverRef, bottomInView] = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (bottomInView) {
      fetchNextPage();
    }
  }, [bottomInView, fetchNextPage]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <h1>에러가 발생하였습니다.</h1>;
  }

  return (
    <>
      <Header>
        <Navbar>
          <span>구인/구직 게시판</span>
          <SearchWrap>
            <SelectWrap ref={selectWrapRef}>
              <SelectButton onClick={toggleShowList}>
                {currentOpt}
                <IoIosArrowDown style={{ fontSize: "18px" }} />
              </SelectButton>
              {showList && (
                <LanguageUl>
                  {optArr.map((item, index) => {
                    return (
                      <LanguageLi
                        key={index}
                        onClick={() => liClickHandler(index)}
                      >
                        {item}
                      </LanguageLi>
                    );
                  })}
                </LanguageUl>
              )}
            </SelectWrap>

            <SearchInput
              type="text"
              placeholder="키워드를 입력해주세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SearchButton type="button" onClick={searchButtonClickHandler}>
              <GrSearch style={{ fontSize: "22px" }} />
            </SearchButton>
          </SearchWrap>
          <NavItems>
            <NavItem
              className={activeNavItem === "Model" ? "active" : ""}
              onClick={() => {
                handleNavItemClick("Model");
              }}
            >
              Model
            </NavItem>
            <NavItem
              className={activeNavItem === "Photographer" ? "active" : ""}
              onClick={() => handleNavItemClick("Photographer")}
            >
              Photographer
            </NavItem>
          </NavItems>
        </Navbar>
      </Header>
      <Content>
        {searchResults.length > 0 ? (
          <>
            {searchResults.map((item) => (
              <Suspense fallback={<LoadingSpinner />}>
                <BoardItem
                  onClick={() => {
                    if (isLoggedIn) {
                      navigate(`${item.boardId}`);
                    } else {
                      Swal.fire({
                        icon: "warning",
                        title: "회원 전용 서비스!",
                        text: `로그인이 필요한 서비스입니다🙏`,
                        confirmButtonText: "확인",
                      });
                    }
                  }}
                  item={item}
                  key={item.boardId}
                />
              </Suspense>
            ))}
          </>
        ) : (
          data.pages
            .flatMap((page) => page.content)
            .map((item) => (
              <BoardItem
                onClick={() => {
                  if (isLoggedIn) {
                    navigate(`${item.boardId}`);
                  } else {
                    Swal.fire({
                      icon: "warning",
                      title: "회원 전용 서비스!",
                      text: `로그인이 필요한 서비스입니다🙏`,
                      confirmButtonText: "확인",
                    });
                  }
                }}
                item={item}
                key={item.boardId}
              />
            ))
        )}
      </Content>
      {data.pages[data.pages.length - 1].last === false ? (
        <BottomDiv ref={bottomObserverRef}></BottomDiv>
      ) : null}
      {showButton && <ScrollToTopButton />}
    </>
  );
}

export default Board;

const Header = styled.header`
  padding: 16px 0 16px 0;
  border-bottom: 1px solid #ddd;
  margin: 0 150px;

  @media (max-width: 768px) {
    margin: 0 30px;
  }
`;

const BottomDiv = styled.div`
  height: 1px;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #483767;
  border-radius: 30px;
  width: 70%;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SelectWrap = styled.div`
  position: relative;
  margin-right: 10px;

  @media (max-width: 768px) {
    margin-right: 5px;
  }
`;

const SelectButton = styled.button`
  margin: 5px;
  width: 100px;
  padding: 10px 5px;
  gap: 5px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: none;
  border-radius: 21px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  &:hover {
    background-color: #f1f1f1;
    opacity: 70%;
  }
`;

const LanguageUl = styled.ul`
  width: 100px;
  z-index: 10;
  margin: 0;
  padding-left: 0;
  list-style: none;
  position: absolute;
  color: #483767;
  border-radius: 7px;
  overflow: hidden;
`;

const LanguageLi = styled.li`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: none;
  font-size: 16px;
  flex: 1;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.3);
  }
`;

const SearchButton = styled.button`
  padding: 8px 12px;
  background-color: transparent;
  border: none;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const NavItems = styled.ul`
  display: flex;
  align-items: center;
  gap: 20px;
  list-style: none;
`;

const NavItem = styled.li`
  font-size: 16px;
  color: #999999;
  cursor: pointer;

  &.active {
    color: #483767;
  }
`;

const Content = styled.div`
  padding: 30px 150px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 45px;
  @media (max-width: 1300px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;
