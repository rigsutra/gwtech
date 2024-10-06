import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
// Chakra imports
import {
  Flex,
  Text,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast,
  HStack,
  useColorMode,
  Select,
  VStack,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { CgSearch } from "react-icons/cg";
import { FaMinus } from "react-icons/fa";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const init = { gameCategory: "BLT", gameNumber: "", limitsButs: "" };

function LimitNumber() {
  const [editing, setEditing] = useState(false);
  const [currentLimitNumbers, setCurrentLimitNumbers] = useState(null);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  // const [gameCategories, setGameCategories] = useState([]);
  const [limitNumbers, setLimitNumbers] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [generalPageActive, setGeneralPageActive] = useState(true);

  const [specificGameNumberLimits, setSpecificGameNumberLimits] = useState([
    init,
  ]);

  const [blt, setBlt] = useState("");
  const [l3c, setL3c] = useState("");
  const [mrg, setMrg] = useState("");
  const [l4c, setL4c] = useState("");
  const [l5c, setL5c] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleGetLimit = async (general) => {
    try {
      await api()
        .get(`/subadmin/getlimitbut?general=${general}`)
        .then((response) => {
          setLimitNumbers(response.data);
          setGeneralPageActive(general);
        });
    } catch (err) {}
  };

  useEffect(async () => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        setLotteryCategoryName(response.data.data[0]?.lotteryName);
        setLotteryCategories(response.data.data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching lottery categories",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      // try {
      //   const response = await api().get("/admin/getgamecategory");
      //   setGameCategories(response.data);
      // } catch (error) {
      //   console.error(error);
      //   toast({
      //     title: "Error fetching game categories",
      //     status: "error",
      //     duration: 5000,
      //     isClosable: true,
      //   });
      // }
    };

    const fetchSeller = async () => {
      try {
        const response = await api().get("/subadmin/getseller");
        setSellerInfo(response.data.users);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching seller info",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchSeller();

    fetchLotteryCategories();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    let limits = null;
    if (generalPageActive) {
      if(blt != "" && l3c != "" && mrg != "" && l4c != "" && l5c != "") {
        limits = [
          {
            gameCategory: "BLT",
            limitsButs: blt,
          },
          {
            gameCategory: "L3C",
            limitsButs: l3c,
          },
          {
            gameCategory: "MRG",
            limitsButs: mrg,
          },
          {
            gameCategory: "L4C",
            limitsButs: l4c,
          },
          {
            gameCategory: "L5C",
            limitsButs: l5c,
          },
        ];
      } else {
        alert("An unentered limit number exists!");
        return;
      }
    } else {
      let emptyFlag = false;
      specificGameNumberLimits.forEach(item => {
        console.log(item);
        if(item.gameNumber.trim() == "" || item.limitsButs == "") {
          emptyFlag = true;
          return false;
        }
      })

      if(!emptyFlag) {
        limits = specificGameNumberLimits;
      } else {
        alert("An unentered limit number exists!");
        return;
      }
    }
    if (editing) {
      updateLimitNumbers(currentLimitNumbers._id, limits);
    } else {
      createLimitNumbers(limits);
    }
    setSelectedSellerId("");
  };

  const createLimitNumbers = (limits) => {
    try {
      api()
        .post(`/subadmin/addlimitbut`, {
          lotteryCategoryName: lotteryCategoryName.trim(),
          seller: selectedSellerId,
          limits: limits,
          general: generalPageActive
        })
        .then((res) => {
          setLimitNumbers([...limitNumbers, res.data]);
          setLotteryCategoryName("");
          onClose();
          toast({
            title: "Limit Numbers created.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((err) => {
          toast({
            title: "Error creating Limit Numbers.",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } catch (err) {}
  };

  const handleEdit = (limit) => {
    setEditing(true);
    setCurrentLimitNumbers(limit);
    setLotteryCategoryName(limit.lotteryCategoryName);
    setSelectedSellerId(limit.seller);
    if (generalPageActive) {
      setBlt(limit.limits[0].limitsButs);
      setL3c(limit.limits[1].limitsButs);
      setMrg(limit.limits[2].limitsButs);
      setL4c(limit.limits[3].limitsButs);
      setL5c(limit.limits[4].limitsButs);
    } else {
      setSpecificGameNumberLimits(limit.limits);
    }
    onOpen();
  };

  const deleteLimitNumbers = (id) => {
    api()
      .delete(`/subadmin/deletelimitbut/${id}`, {general: generalPageActive})
      .then(() => {
        setLimitNumbers(limitNumbers.filter((number) => number._id !== id));
        toast({
          title: "Limit Numbers deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateLimitNumbers = (id, limits) => {
    try {
      api()
        .patch(`/subadmin/updatelimitbut/${id}`, {
          lotteryCategoryName: lotteryCategoryName.trim(),
          seller: selectedSellerId,
          limits: limits,
          general: generalPageActive
        })
        .then((res) => {
          setLimitNumbers(
            limitNumbers.map((limit) => (limit._id === id ? res.data : limit))
          );
          setLotteryCategoryName("");
          onClose();
          toast({
            title: "Limit Numbers updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((err) => {
          toast({
            title: "Error updating Limit Numbers.",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      {/* Authors Table */}
      <Card
        overflowX={{ sm: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="100%"
        border={{ base: "none", md: "1px solid gray" }}
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Text fontSize="lg" color="black" font="Weight:bold">
            Limit Numbers
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={() => {
                handleGetLimit(true);
              }}
              bg={colorMode === "light" ? "blue.500" : "blue.300"}
              _hover={{
                bg: colorMode === "light" ? "blue.600" : "blue.200",
              }}
            >
              <CgSearch size={"20px"} color="white" />
              General
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleGetLimit(false);
              }}
              bg={colorMode === "light" ? "cyan.500" : "blue.300"}
              _hover={{
                bg: colorMode === "light" ? "cyan.600" : "blue.200",
              }}
            >
              <CgSearch size={"20px"} color="white" />
              Specific
            </Button>
          </HStack>
          <Button
            size="sm"
            onClick={() => {
              setLotteryCategoryName(lotteryCategories[0]?.lotteryName);
              setEditing(false);
              setSpecificGameNumberLimits([init]);
              onOpen();
            }}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              bg: colorMode === "light" ? "blue.600" : "blue.200",
            }}
          >
            <FaPlus size={24} color="white" />
          </Button>
        </CardHeader>
        <CardBody>
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="flex-start"
            width="100%"
          >
            {limitNumbers.map((limit) => (
              <Stack
                key={limit._id}
                spacing={1}
                width="350px"
                borderRadius="3px"
                p="10px"
                m="10px"
                border={"1px solid gray"}
                boxShadow="0px 0px 2px white"
              >
                <VStack spacing={2} align="stretch">
                  <FormControl id="lotteryCategoryName" isRequired>
                    <HStack justifyContent={"space-between"}>
                      <HStack>
                        <FormLabel m="0">Seller</FormLabel>
                        <FormLabel>
                          {limit.seller?.userName
                            ? limit.seller.userName
                            : "All"}
                        </FormLabel>
                      </HStack>
                      <Box>
                        <Button
                          size="sm"
                          mr={2}
                          onClick={() => handleEdit(limit)}
                          bg={
                            colorMode === "light" ? "yellow.500" : "yellow.300"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "yellow.600"
                                : "yellow.200",
                          }}
                        >
                          <FaEdit size={16} color="white" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteLimitNumbers(limit?._id)}
                          bg={colorMode === "light" ? "red.500" : "red.300"}
                          _hover={{
                            bg: colorMode === "light" ? "red.600" : "red.200",
                          }}
                        >
                          <RiDeleteBinLine size={16} color="white" />
                        </Button>
                      </Box>
                    </HStack>
                  </FormControl>
                  <FormControl id="lotteryCategoryName" isRequired>
                    <HStack alignItems={"center"}>
                      <FormLabel>Lottery Category</FormLabel>
                      <FormLabel>{limit.lotteryCategoryName}</FormLabel>
                    </HStack>
                  </FormControl>
                  {generalPageActive ? (
                    <>
                      <FormControl id="blt" isRequired>
                        <HStack>
                          <FormLabel width="100px">
                            {limit.limits[0]?.gameCategory}
                          </FormLabel>
                          <Input
                            isReadOnly={true}
                            value={limit.limits[0]?.limitsButs}
                          />
                        </HStack>
                      </FormControl>
                      <FormControl id="l3c" isRequired>
                        <HStack>
                          <FormLabel width="100px">
                            {limit.limits[1]?.gameCategory}
                          </FormLabel>
                          <Input
                            isReadOnly={true}
                            value={limit.limits[1]?.limitsButs}
                          />
                        </HStack>
                      </FormControl>
                      <FormControl id="mrg" isRequired>
                        <HStack>
                          <FormLabel width="100px">
                            {limit.limits[2]?.gameCategory}
                          </FormLabel>
                          <Input
                            isReadOnly={true}
                            value={limit.limits[2]?.limitsButs}
                          />
                        </HStack>
                      </FormControl>
                      <FormControl id="l4c" isRequired>
                        <HStack>
                          <FormLabel width="100px">
                            {limit.limits[3]?.gameCategory}
                          </FormLabel>
                          <Input
                            isReadOnly={true}
                            value={limit.limits[3]?.limitsButs}
                          />
                        </HStack>
                      </FormControl>
                      <FormControl id="l5c" isRequired>
                        <HStack>
                          <FormLabel width="100px">
                            {limit.limits[4]?.gameCategory}
                          </FormLabel>
                          <Input
                            isReadOnly={true}
                            value={limit.limits[4]?.limitsButs}
                          />
                        </HStack>
                      </FormControl>
                    </>
                  ) : (
                    <FormControl id="specific-limit-layout">
                      {limit.limits.map((item, index) => (
                        <LimitAddCompoment
                          key={index}
                          gameCategory={item.gameCategory}
                          gameNumber={item.gameNumber}
                          limitsButs={item.limitsButs}
                          lock={true}
                        />
                      ))}
                    </FormControl>
                  )}
                </VStack>
              </Stack>
            ))}
          </Flex>
        </CardBody>
      </Card>
      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit LimitNumber" : "Create LimitNumber"}
        submitButtonText={editing ? "Update" : "Add"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          <FormControl id="lotteryCategoryName" isRequired>
            <FormLabel m="0">Seller</FormLabel>
            <Select
              onChange={(event) => setSelectedSellerId(event.target.value)}
              defaultValue={selectedSellerId}
            >
              <option value={""}>All</option>
              {sellerInfo.map((info) => (
                <option key={info._id} value={info._id}>
                  {info.userName}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="lotteryCategoryName" isRequired>
            <FormLabel>Lottery Category Name</FormLabel>
            <Select
              onChange={(event) => setLotteryCategoryName(event.target.value)}
              defaultValue={lotteryCategoryName}
            >
              {lotteryCategories.map((category) => (
                <option key={category._id} value={category.lotteryName}>
                  {category.lotteryName}
                </option>
              ))}
            </Select>
          </FormControl>
          {generalPageActive ? (
            <>
              <FormControl id="blt" isRequired>
                <HStack>
                  <FormLabel width="100px">BLT</FormLabel>
                  <Input
                    placeholder="Enter Limit"
                    type="number"
                    value={blt}
                    onChange={(e) => setBlt(e.target.value)}
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    color={colorMode === "light" ? "gray.800" : "white"}
                  />
                </HStack>
              </FormControl>
              <FormControl id="l3c" isRequired>
                <HStack>
                  <FormLabel width="100px">L3C</FormLabel>
                  <Input
                    placeholder="Enter Limit"
                    type="number"
                    value={l3c}
                    onChange={(e) => setL3c(e.target.value)}
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    color={colorMode === "light" ? "gray.800" : "white"}
                  />
                </HStack>
              </FormControl>
              <FormControl id="mrg" isRequired>
                <HStack>
                  <FormLabel width="100px">MRG</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter Limit"
                    value={mrg}
                    onChange={(e) => setMrg(e.target.value)}
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    color={colorMode === "light" ? "gray.800" : "white"}
                  />
                </HStack>
              </FormControl>
              <FormControl id="l4c" isRequired>
                <HStack>
                  <FormLabel width="100px">L4C</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter Limit"
                    value={l4c}
                    onChange={(e) => setL4c(e.target.value)}
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    color={colorMode === "light" ? "gray.800" : "white"}
                  />
                </HStack>
              </FormControl>
              <FormControl id="l5c" isRequired>
                <HStack>
                  <FormLabel width="100px">L5C</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter Limit"
                    value={l5c}
                    onChange={(e) => setL5c(e.target.value)}
                    bg={colorMode === "light" ? "white" : "gray.700"}
                    color={colorMode === "light" ? "gray.800" : "white"}
                  />
                </HStack>
              </FormControl>
            </>
          ) : (
            <FormControl id="specific-limit-layout">
              {specificGameNumberLimits.map((item, index) => (
                <LimitAddCompoment
                  key={index}
                  gameCategory={item.gameCategory}
                  gameNumber={item.gameNumber}
                  limitsButs={item.limitsButs}
                  setData={setSpecificGameNumberLimits}
                  data={specificGameNumberLimits}
                  index={index}
                  lastItemFlag={
                    specificGameNumberLimits.length - 1 == index ? true : false
                  }
                  lock={false}
                />
              ))}
            </FormControl>
          )}
        </Stack>
      </Modal>
    </Flex>
  );
}

function LimitAddCompoment({
  gameCategory,
  gameNumber,
  limitsButs,
  setData,
  data,
  index,
  lastItemFlag,
  lock,
}) {
  const { colorMode } = useColorMode();
  const [gameCt, setGameCt] = useState("");
  const [length, setLength] = useState(2);

  function updateSpecificGameNumberLimits(index, updatedData) {
    setData((prevState) => {
      const update = [...prevState];
      update[index] = updatedData;
      return update;
    });
  }

  const removeItem = (index) => {
    setData((prevState) => {
      const updatedArray = [...prevState];
      updatedArray.splice(index, 1);
      return updatedArray;
    });
  };

  return (
    <HStack my="3px">
      {lock ? (
        <Input isReadOnly={true} value={gameCategory} />
      ) : (
        <Select
          onChange={(event) => {
            const value = event.target.value.trim();
            setGameCt(value);

            if (value == "BLT") {
              setLength(2);
            } else if (value == "L3C") {
              setLength(3);
            } else if (value == "L4C") {
              setLength(4);
            } else if (value == "L5C" || value == "MRG") {
              setLength(5);
            }

            const updatedData = {
              ...data[index],
              gameCategory: value,
              gameNumber: "",
            };
            updateSpecificGameNumberLimits(index, updatedData);
          }}
          defaultValue={gameCategory}
          minWidth={"80px"}
        >
          <option value="BLT">BLT</option>
          <option value="L3C">L3C</option>
          <option value="MRG">MRG</option>
          <option value="L4C">L4C</option>
          <option value="L5C">L5C</option>
        </Select>
      )}
      <Input
        placeholder="Enter Game Number"
        type="text"
        value={gameNumber}
        maxLength={length}
        onChange={(event) => {
          const number = event.target.value.trim();
          let gNumber = null;
          if (gameCt == "MRG") {
            if (number.length == 2) {
              gNumber = `${number}×`;
            } else {
              gNumber = number;
            }
          } else {
            gNumber = number;
          }

          const updatedData = { ...data[index], gameNumber: gNumber };
          updateSpecificGameNumberLimits(index, updatedData);
        }}
        isReadOnly={lock}
      />
      <Input
        placeholder="Enter Limit"
        type="number"
        value={limitsButs}
        onChange={(event) => {
          const updatedData = {
            ...data[index],
            limitsButs: event.target.value,
          };
          updateSpecificGameNumberLimits(index, updatedData);
        }}
        isReadOnly={lock}
      />
      {lock ? (
        <></>
      ) : (
        <>
          {lastItemFlag ? (
            <Button
              p="10px"
              size="sm"
              onClick={() => {
                setData((prev) => [...prev, init]);
              }}
              bg={colorMode === "light" ? "cyan.500" : "blue.300"}
              _hover={{
                bg: colorMode === "light" ? "cyan.600" : "blue.200",
              }}
            >
              <FaPlus size="30px" color="white" />
            </Button>
          ) : (
            <Button
              p="10px"
              size="sm"
              onClick={() => {
                removeItem(index);
              }}
              bg={colorMode === "light" ? "cyan.500" : "blue.300"}
              _hover={{
                bg: colorMode === "light" ? "cyan.600" : "blue.200",
              }}
            >
              <FaMinus size="30px" color="white" />
            </Button>
          )}
        </>
      )}
    </HStack>
  );
}

export default LimitNumber;
