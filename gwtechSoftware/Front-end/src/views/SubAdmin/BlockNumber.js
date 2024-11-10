import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
// Chakra imports
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Button,
  FormControl,
  FormLabel,
  Input,
  Td,
  Tr,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
  Select,
  RadioGroup,
  Radio,
  HStack,
  VStack,
  Box,
} from "@chakra-ui/react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { CgSearch } from "react-icons/cg";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

function BlockNumber() {
  const [editing, setEditing] = useState(false);
  const [currentBlockNumbers, setCurrentBlockNumbers] = useState(null);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [gameCategories, setGameCategories] = useState([]);
  const [gameCategory, setGameCategory] = useState("");
  const [newBlockNumber, setNewBlockNumber] = useState("");
  const [blockNumbers, setBlockNumbers] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [supervisorInfo, setSupervisorInfo] = useState([]);
  const [activeView, setActiveView] = useState("all");
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleChangeBlockNumber = (event) => {
    if (gameCategory === "MRG" && event.target.value.trim().length === 2) {
      setNewBlockNumber(`${event.target.value}×`);
    } else {
      setNewBlockNumber(event.target.value);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          lotteryResponse,
          gameResponse,
          sellerResponse,
          supervisorResponse,
        ] = await Promise.all([
          api().get("/admin/getlotterycategory"),
          api().get("/admin/getgamecategory"),
          api().get("/subadmin/getseller"),
          api().get("/subadmin/getsuperVisor"),
        ]);

        setLotteryCategories(lotteryResponse.data.data);
        setGameCategories(gameResponse.data);
        setSellerInfo(sellerResponse.data.users);
        setSupervisorInfo(supervisorResponse.data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching initial data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    if (activeView === "all") {
      setShowSearchForm(false);
      fetchBlockNumbers();
    } else {
      setShowSearchForm(true);
      setBlockNumbers([]);
    }
  }, [activeView]);

  const fetchBlockNumbers = async () => {
    setIsLoading(true);
    try {
      let response;
      if (activeView === "all") {
        response = await api().get("/subadmin/getblocknumberButAll");
      } else if (activeView === "supervisor") {
        response = await api().get("/subadmin/getblocknumberButSuperVisor", {
          params: {
            superVisor: selectedSupervisorId,
            lotteryCategoryName,
            gameCategory,
          },
        });
      } else if (activeView === "seller") {
        response = await api().get("/subadmin/getblocknumberButSeller", {
          params: {
            seller: selectedSellerId,
            lotteryCategoryName,
            gameCategory,
          },
        });
      }
      setBlockNumbers(response.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching block numbers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setBlockNumbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetBlockNumbers = (viewType) => {
    setActiveView(viewType);
    setSelectedSellerId("");
    setSelectedSupervisorId("");
    setLotteryCategoryName("");
    setGameCategory("");
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (activeView === "supervisor") {
        response = await api().get("/subadmin/getblocknumberButSuperVisor", {
          params: {
            superVisor: selectedSupervisorId,
            lotteryCategoryName,
            gameCategory,
          },
        });
      } else if (activeView === "seller") {
        response = await api().get("/subadmin/getblocknumberButSeller", {
          params: {
            seller: selectedSellerId,
            lotteryCategoryName,
            gameCategory,
          },
        });
      }
      setBlockNumbers(response.data);
      toast({
        title: "Block numbers fetched successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching block numbers",
        description: error.message || "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setBlockNumbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editing) {
      updateBlockNumbers(currentBlockNumbers._id);
    } else {
      createBlockNumbers();
    }
  };

  const createBlockNumbers = () => {
    const data = {
      lotteryCategoryName: lotteryCategoryName.trim(),
      gameCategory: gameCategory.trim(),
      number: newBlockNumber.trim(),
    };
    if (activeView === "supervisor") {
      data.superVisor = selectedSupervisor;
    } else if (activeView === "seller") {
      data.seller = selectedSeller;
    }
    api()
      .post(`/subadmin/addblocknumber`, data)
      .then((res) => {
        setBlockNumbers([...blockNumbers, res.data]);
        resetForm();
        toast({
          title: "Block Number created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title: "Error creating Block Number.",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleEdit = (numbers) => {
    setEditing(true);
    setCurrentBlockNumbers(numbers);
    setLotteryCategoryName(numbers.lotteryCategoryName);
    setGameCategory(numbers.gameCategory);
    setNewBlockNumber(numbers.number);
    if (numbers.seller) {
      setSelectedSeller(numbers.seller._id);
      setActiveView("seller");
    } else if (numbers.superVisor) {
      setSelectedSupervisor(numbers.superVisor._id);
      setActiveView("supervisor");
    } else {
      setActiveView("all");
    }
    onOpen();
  };

  const deleteBlockNumbers = (id) => {
    api()
      .delete(`/subadmin/deleteblocknumber/${id}`)
      .then(() => {
        setBlockNumbers(blockNumbers.filter((number) => number._id !== id));
        toast({
          title: "Block Number deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateBlockNumbers = (id) => {
    const data = {
      lotteryCategoryName: lotteryCategoryName.trim(),
      gameCategory: gameCategory.trim(),
      number: newBlockNumber.trim(),
    };
    if (activeView === "supervisor") {
      data.superVisor = selectedSupervisor;
    } else if (activeView === "seller") {
      data.seller = selectedSeller;
    }
    api()
      .patch(`/subadmin/updateblocknumber/${id}`, data)
      .then((res) => {
        setBlockNumbers(
          blockNumbers.map((number) => (number._id === id ? res.data : number))
        );
        resetForm();
        toast({
          title: "Block Number updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title: "Error updating Block Number.",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const resetForm = () => {
    setNewBlockNumber("");
    setLotteryCategoryName("");
    setGameCategory("");
    setSelectedSeller("");
    setSelectedSupervisor("");
    setEditing(false);
    onClose();
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card
        overflowX={{ sm: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="100%"
        border={{ base: "none", md: "1px solid gray" }}
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize="lg" fontWeight="bold">
            Block Numbers Table
          </Text>
          <RadioGroup
            onChange={handleGetBlockNumbers}
            value={activeView}
            display="flex"
            gap={4}
          >
            <Radio value="all" colorScheme="blue" size="lg">
              All
            </Radio>
            <Radio value="supervisor" colorScheme="blue" size="lg">
              Supervisor
            </Radio>
            <Radio value="seller" colorScheme="blue" size="lg">
              Seller
            </Radio>
          </RadioGroup>
          <Button
            size="sm"
            onClick={() => {
              setEditing(false);
              setLotteryCategoryName(lotteryCategories[0]?.lotteryName || "");
              setGameCategory(gameCategories[0]?.gameName || "");
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
        {showSearchForm && (
          <CardHeader
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            gap={5}
            marginY="20px"
            justifyContent="center"
          >
            <HStack>
              <FormControl flex={1}>
                <FormLabel>
                  {activeView === "seller" ? "Seller" : "Supervisor"}
                </FormLabel>
                <Select
                  value={
                    activeView === "seller"
                      ? selectedSellerId
                      : selectedSupervisorId
                  }
                  onChange={(e) =>
                    activeView === "seller"
                      ? setSelectedSellerId(e.target.value)
                      : setSelectedSupervisorId(e.target.value)
                  }
                >
                  <option value="">All</option>
                  {(activeView === "seller" ? sellerInfo : supervisorInfo).map(
                    (person) => (
                      <option key={person._id} value={person._id}>
                        {person.userName}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Lottery Category</FormLabel>
                <Select
                  value={lotteryCategoryName}
                  onChange={(e) => setLotteryCategoryName(e.target.value)}
                >
                  <option value="">All</option>
                  {lotteryCategories.map((category) => (
                    <option key={category._id} value={category.lotteryName}>
                      {category.lotteryName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Game Category</FormLabel>
                <Select
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value)}
                >
                  <option value="">All</option>
                  {gameCategories.map((name) => (
                    <option key={name._id} value={name.gameName}>
                      {name.gameName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <VStack>
                <Text marginBottom="20px"></Text>
                <Button
                  onClick={handleSearch}
                  bg="blue.600"
                  color="white"
                  isLoading={isLoading}
                >
                  <CgSearch />
                </Button>
              </VStack>
            </HStack>
          </CardHeader>
        )}
        <CardBody>
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th color="black">User</Th>
                <Th color="black">Lottery Name</Th>
                <Th color="black">Game Name</Th>
                <Th color="black">Block Number</Th>
                <Th color="black">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {blockNumbers.map((number) => (
                <Tr key={number._id}>
                  <Td>
                    {number.seller?.userName ||
                      number.superVisor?.userName ||
                      "All"}
                  </Td>
                  <Td>
                    <pre>{number.lotteryCategoryName}</pre>
                  </Td>
                  <Td>
                    <pre>{number.gameCategory}</pre>
                  </Td>
                  <Td>
                    <pre>{number.number}</pre>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => handleEdit(number)}
                      bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                      _hover={{
                        bg: colorMode === "light" ? "yellow.600" : "yellow.200",
                      }}
                    >
                      <FaEdit size={20} color="white" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteBlockNumbers(number._id)}
                      bg={colorMode === "light" ? "red.500" : "red.300"}
                      _hover={{
                        bg: colorMode === "light" ? "red.600" : "red.200",
                      }}
                    >
                      <RiDeleteBinLine size={20} color="white" />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      {/* Create/Edit Block Number Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit Block Number" : "Create Block Number"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          <FormControl id="lotteryCategoryName" isRequired>
            <FormLabel>Lottery Category Name</FormLabel>
            <Select
              onChange={(event) => setLotteryCategoryName(event.target.value)}
              value={lotteryCategoryName}
            >
              {lotteryCategories.map((category) => (
                <option key={category._id} value={category.lotteryName}>
                  {category.lotteryName}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="gameName" isRequired>
            <FormLabel>Game Name</FormLabel>
            <Select
              onChange={(event) => setGameCategory(event.target.value)}
              value={gameCategory}
            >
              {gameCategories.map((name) => (
                <option key={name._id} value={name.gameName}>
                  {name.gameName}
                </option>
              ))}
            </Select>
          </FormControl>
          {activeView === "supervisor" && (
            <FormControl>
              <FormLabel>Supervisor</FormLabel>
              <Select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
              >
                <option value="">Select Supervisor</option>
                {supervisorInfo.map((supervisor) => (
                  <option key={supervisor._id} value={supervisor._id}>
                    {supervisor.userName}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          {activeView === "seller" && (
            <FormControl>
              <FormLabel>Seller</FormLabel>
              <Select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
              >
                <option value="">Select Seller</option>
                {sellerInfo.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.userName}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl id="newBlockNumber" isRequired>
            <FormLabel>Block Number</FormLabel>
            <Input
              type="text"
              value={newBlockNumber}
              onChange={handleChangeBlockNumber}
            />
          </FormControl>
        </Stack>
      </Modal>
    </Flex>
  );
}

export default BlockNumber;
