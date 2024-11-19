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
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";
import { Loading } from "components/Loading/Loading.js";

const SoldTickets = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [soldTickets, setSoldTickets] = useState([]);
  const [winningTickets, setWinningTickets] = useState([]);
  const [ticketPaidMap, setTicketPaidMap] = useState({});
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));

  const [gameNumbers, setGameNumbers] = useState([]);
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
  }, [toast]);

  const fetchSoldTickets = async () => {
    try {
      setLoading(true);
      // Define the API endpoints
      const ticketsEndpoint = `/subadmin/gettickets?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${encodeURIComponent(
        lotteryCategoryName.trim()
      )}`;
      const winTicketsEndpoint = `/subadmin/getwintickets?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${encodeURIComponent(
        lotteryCategoryName.trim()
      )}`;

      // Fetch both APIs in parallel
      const [ticketsResponse, winTicketsResponse] = await Promise.all([
        api().get(ticketsEndpoint),
        api().get(winTicketsEndpoint),
      ]);

      // Log the responses for debugging
      console.log("Tickets API Response:", ticketsResponse.data);
      console.log("Winning Tickets API Response:", winTicketsResponse.data);

      const allTickets = ticketsResponse.data.data;
      const allWinningTickets = Array.isArray(winTicketsResponse.data)
        ? winTicketsResponse.data
        : winTicketsResponse.data.data || [];

      setSoldTickets(allTickets);
      setWinningTickets(allWinningTickets);

      // Create a mapping from "seller-ticketId" to paidAmount(s)
      const paidMap = {};
      allWinningTickets.forEach((ticket) => {
        const key = `${ticket.seller}-${String(ticket.ticketId)}`;
        paidMap[key] = ticket.paidAmount;
      });
      console.log("Paid Map:", paidMap); // Debugging
      setTicketPaidMap(paidMap);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching tickets",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (id) => {
    try {
      const result = confirm("Do you really want to delete this ticket?");
      if (result) {
        const res = await api().delete(`/subadmin/deleteticket/${id}`);
        console.log(res.data);
        if (res.data.success) {
          setSoldTickets(soldTickets.filter((ticket) => ticket._id !== id));
          toast({
            title: "Ticket deleted",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: res.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting Ticket",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGetTicketNumbers = async (numbers) => {
    try {
      setGameNumbers(numbers);
      onOpen();
    } catch (ex) {
      console.log(ex);
    }
  };

  const handleCancel = () => {
    onClose();
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
        p={{ base: "5px", md: "20px" }}
        width={{ base: "100%", md: "80%", lg: "78%" }} // Responsive width
        maxWidth="1200px"
        border={{ base: "none", md: "1px solid gray" }}
        borderRadius={"none"}
        boxShadow="lg"
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          flexDirection={{ base: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ base: "flex-start", sm: "center" }}
        >
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={"center"}
            width="100%"
          >
            <Text fontSize="lg" color="black" fontWeight="bold" mb="10px">
              Sold Tickets
            </Text>
            <Flex
              color="black"
              flexWrap="wrap"
              justifyContent="flex-start"
              width="100%"
              alignItems="center"
            >
              {/* Seller Selection */}
              <FormControl id="seller" width="330px" pl={10} isRequired>
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel m="0" p="10px">
                    Seller
                  </FormLabel>
                  <Select
                    onChange={(event) =>
                      setSelectedSellerId(event.target.value)
                    }
                    width="200px"
                    value={selectedSellerId}
                  >
                    <option value="" style={{ backgroundColor: "#e3e2e2" }}>
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

              {/* Lottery Category Selection */}
              <FormControl
                id="lotteryCategoryName"
                width="330px"
                pl={6}
                isRequired
              >
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel py="10px" m="0">
                    Category Name
                  </FormLabel>
                  <Select
                    onChange={(event) =>
                      setLotteryCategoryName(event.target.value.trim())
                    }
                    width="200px"
                    value={lotteryCategoryName}
                  >
                    <option value="" style={{ backgroundColor: "#e3e2e2" }}>
                      All Categories
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

              {/* From Date */}
              <FormControl id="fromDate" width="330px" pl={10} isRequired>
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel p="10px" m="0">
                    From
                  </FormLabel>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>

              {/* To Date */}
              <FormControl id="toDate" width="330px" pl={10} isRequired>
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel m="0">To</FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    width="180px"
                  />
                </HStack>
              </FormControl>

              {/* Search Button */}
              <Button
                size="sm"
                onClick={fetchSoldTickets}
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
            <Stack
              spacing={1}
              // borderRadius="3px"
              m="5px"
              boxShadow="0px 0px 2px white"
              width="100%"
            >
              <VStack spacing={4}>
                <Flex overflowX="auto">
                  <Table>
                    <Thead>
                      <Tr padding="none">
                        <Th whiteSpace="nowrap">Ticket ID</Th>
                        <Th whiteSpace="nowrap">Price</Th>
                        <Th whiteSpace="nowrap">Paid</Th>
                        <Th whiteSpace="nowrap">Date</Th>
                        <Th whiteSpace="nowrap">Lottery</Th>
                        <Th whiteSpace="nowrap">Seller</Th>
                        <Th whiteSpace="nowrap">Company</Th>
                        <Th whiteSpace="nowrap">Action</Th>
                      </Tr>
                    </Thead>
                    {loading ? (
                      <Tbody>
                        <Tr>
                          <Td colSpan={6}>
                            <Loading />
                          </Td>
                        </Tr>
                      </Tbody>
                    ) : (
                      <Tbody>
                        {soldTickets.map((item) => {
                          const totalAmount = item.numbers.reduce(
                            (acc, number) => {
                              if (!number.bonus) return acc + number.amount;
                              return acc;
                            },
                            0
                          );

                          // Get the paid amount from the ticketPaidMap
                          const key = `${item.seller}-${item.ticketId}`;
                          const paidAmount = ticketPaidMap[key] || "None"; // If no paid amount, show "N/A"

                          return (
                            <Tr key={item._id} width="80%">
                              <Td>
                                <Button
                                  className="tableInterBtn"
                                  size="sm"
                                  width="70%"
                                  backgroundColor={"#edf2f7"}
                                  onClick={() =>
                                    handleGetTicketNumbers(item.numbers)
                                  }
                                >
                                  {item.ticketId}
                                </Button>
                              </Td>
                              <Td whiteSpace="nowrap" fontSize="14px">
                                {totalAmount}
                              </Td>
                              <Td whiteSpace="nowrap" fontSize="14px">
                                {paidAmount}
                              </Td>{" "}
                              {/* Display the Paid Amount */}
                              <Td whiteSpace="nowrap" fontSize="14px">
                                {formatDate(item.date.substr(0, 10))}
                              </Td>
                              <Td whiteSpace="nowrap" fontSize="14px">
                                {item.lotteryCategoryName}
                              </Td>
                              <Td whiteSpace="nowrap" fontSize="14px">
                                {
                                  sellerInfo.find(
                                    (sitem) => sitem._id === item.seller
                                  )?.userName
                                }
                              </Td>
                              <Td whiteSpace="nowrap" fontSize="14px">
                                {companyName}
                              </Td>
                              <Td>
                                <Button
                                  className="tableInterBtn"
                                  size="sm"
                                  onClick={() => deleteTicket(item._id)}
                                  bg={
                                    colorMode === "light"
                                      ? "red.600"
                                      : "blue.300"
                                  }
                                  _hover={{
                                    bg:
                                      colorMode === "light"
                                        ? "red.300"
                                        : "blue.200",
                                  }}
                                >
                                  <RiDeleteBinLine size={14} color="white" />
                                </Button>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    )}
                  </Table>
                </Flex>
              </VStack>
            </Stack>
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
              {gameNumbers.map((items) => {
                return items.bonus ? (
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
                ) : (
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
                );
              })}
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
            </Thead>
          </Table>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default SoldTickets;
