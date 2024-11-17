import { useState, useEffect, Fragment } from "react";
import api from "../../utils/customFetch.js";

import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
  VStack,
  HStack,
  Select,
  Text,
  Box,
} from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";
import { Loading } from "components/Loading/Loading.js";

const WinnerTickets = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [winnerTickets, setWinnerTickets] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [gameNumbers, setGameNumbers] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [winningAmount, setWinningAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
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
    };
    fetchLotteryCategories();

    const fetchSeller = async () => {
      try {
        const response = await api().get("/subadmin/getseller");
        setSellerInfo(response.data.users);
        setCompanyName(response.data.companyName);
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
  }, []);

  const fetchWinnerTickets = async () => {
    try {
      setLoading(true);
      const response = await api().get(
        `/subadmin/getwintickets?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${lotteryCategoryName.trim()}`
      );
      console.log(response.data.data);
      setWinnerTickets(response.data.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching winner tickets",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${month}/${day}/${year}`;
    }
    // Return the original string if it doesn't match the expected format
    return dateString;
  };

  const handleGetTicketNumbers = async (numbers, paidAmount) => {
    try {
      setGameNumbers(numbers);
      setPaidAmount(paidAmount);
      onOpen();
    } catch (ex) {
      console.log(ex);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Flex
      direction="column"
      pt={{ base: "120px", md: "75px" }}
      justifyContent="center"
      alignItems="center" // Add this to center children horizontally
      width="100%"
    >
      <Card
        overflowX="auto"
        p={{ base: "10px", md: "20px" }}
        width={{ base: "100%", md: "80%", lg: "65%" }} // Responsive width
        maxWidth="1200px"
        border={{ base: "none", md: "1px solid gray" }}
        borderRadius={"none"}
        boxShadow="lg"
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          justifyContent="space-between"
        >
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={"center"}
            width="100%"
          >
            <Text fontSize="lg" color="black" font="Weight:bold" mb="10px">
              Win Tickets
            </Text>
            <Flex
              color="black"
              flexWrap="wrap"
              justifyContent="flex-start"
              width="100%"
              alignItems="center"
            >
              <FormControl
                id="lotteryCategoryName"
                width="280px"
                isRequired
                py="5px"
                pl={10}
              >
                <HStack justifyContent="space-between">
                  <FormLabel m="0">Seller</FormLabel>
                  <Select
                    onChange={(event) =>
                      setSelectedSellerId(event.target.value)
                    }
                    width="200px"
                  >
                    <option value={""} style={{ backgroundColor: "#e3e2e2" }}>
                      All
                    </option>
                    {sellerInfo.map((info) => (
                      <option
                        key={info._id}
                        value={info._id}
                        style={{ backgroundColor: "#e3e2e2" }}
                      >
                        {info.userName}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>
              <FormControl
                id="lotteryCategoryName"
                width="300px"
                isRequired
                pl={1}
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel m="0">Category </FormLabel>
                  <Select
                    onChange={(event) =>
                      setLotteryCategoryName(event.target.value.trim())
                    }
                    width="200px"
                  >
                    <option value={""} style={{ backgroundColor: "#e3e2e2" }}>
                      All Category
                    </option>
                    {lotteryCategories.map((category) => (
                      <option
                        key={category._id}
                        value={category.lotteryName}
                        style={{ backgroundColor: "#e3e2e2" }}
                      >
                        {category.lotteryName}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>
              <FormControl
                pl={10}
                id="fromDate"
                width="280px"
                isRequired
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel m="0">From</FormLabel>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>
              <FormControl
                pl={10}
                id="toDate"
                width="300px"
                isRequired
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel m="0">To</FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>

              <Button
                size="sm"
                onClick={fetchWinnerTickets}
                bg={colorMode === "light" ? "red.600" : "blue.300"}
                _hover={{
                  bg: colorMode === "light" ? "red.500" : "blue.200",
                }}
                mx={"10px"}
              >
                <CgSearch size={20} color={"white"} />
              </Button>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody pb="15px">
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="flex-start"
            width="100%"
          >
            <VStack spacing={3} align="stretch" width="100%">
              <Table variant="striped" color="black">
                <Thead>
                  <Tr>
                    <Th color="black">Ticket ID</Th>
                    <Th color="black">Company</Th>
                    <Th color="black">Date</Th>
                    <Th color="black">Lottery</Th>
                    <Th color="black">Seller</Th>
                    <Th color="black">Amount Won</Th>
                  </Tr>
                </Thead>
                {loading ? (
                  <Tbody>
                    <Tr>
                      <Td colSpan={4}>
                        <Loading />
                      </Td>
                    </Tr>
                  </Tbody>
                ) : (
                  <Tbody>
                    {winnerTickets.map((item, index) => {
                      return (
                        <Tr key={item._id}>
                          <Td>
                            <Button
                              className="tableInterBtn"
                              size="sm"
                              width="100%"
                              backgroundColor={"#edf2f7"}
                              onClick={() =>
                                handleGetTicketNumbers(
                                  item.numbers,
                                  item.paidAmount
                                )
                              }
                            >
                              {item.ticketId}
                            </Button>
                          </Td>
                          <Td>
                            <pre>{companyName}</pre>
                          </Td>
                          <Td>
                            <pre>{formatDate(item.date.substr(0, 10))}</pre>
                          </Td>
                          <Td>
                            <pre>{item.lotteryCategoryName}</pre>
                          </Td>
                          <Td>
                            <pre>
                              {
                                sellerInfo.find(
                                  (sitem) => sitem._id === item.seller
                                )?.userName
                              }
                            </pre>
                          </Td>
                          <Td>
                            <pre>{item.amountWon}</pre>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                )}
              </Table>
            </VStack>
          </Flex>
        </CardBody>
      </Card>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        colorMode={colorMode}
        title={"Game Numbers"}
        submitButtonText={"Ok"}
        onSubmit={handleCancel}
      >
        <Stack pt="20px">
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th color="black">Game Name</Th>
                <Th color="black" p="3px">
                  Number
                </Th>
                <Th color="black" p="3px">
                  Amount
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {gameNumbers.map((items) =>
                items?.winFlag ? (
                  <Tr key={items._id}>
                    <Td color="blue">
                      <pre>{items.gameCategory}</pre>
                    </Td>
                    <Td color="blue">
                      <pre>{items.number}</pre>
                    </Td>
                    <Td color="blue">
                      <pre>{items.amount}</pre>
                    </Td>
                  </Tr>
                ) : !items.bonus ? (
                  <Tr key={items._id}>
                    <Td>
                      <pre>{items.gameCategory}</pre>
                    </Td>
                    <Td>
                      <pre>{items.number}</pre>
                    </Td>
                    <Td>
                      <pre>{items.amount}</pre>
                    </Td>
                  </Tr>
                ) : (
                  <Tr key={items._id}>
                    <Td color="brown">
                      <pre>{items.gameCategory}(Bonus)</pre>
                    </Td>
                    <Td color="brown">
                      <pre>{items.number}</pre>
                    </Td>
                    <Td color="brown">
                      <pre>{items.amount}</pre>
                    </Td>
                  </Tr>
                )
              )}
            </Tbody>
            <Thead>
              <Tr>
                <Th color="#f00" p="3px">
                  Total
                </Th>
                <Th color="#f00" p="3px">
                  HTG
                </Th>
                <Th color="#f00" p="3px">
                  {gameNumbers.reduce(
                    (total, value) =>
                      !value.bonus ? total + value.amount : total,
                    0
                  )}
                </Th>
              </Tr>
              <Tr>
                <Th color="#f00" p="3px" colSpan={2}>
                  Paid Amount
                </Th>
                <Th color="#f00" p="3px">
                  {paidAmount}
                </Th>
              </Tr>
            </Thead>
          </Table>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default WinnerTickets;
