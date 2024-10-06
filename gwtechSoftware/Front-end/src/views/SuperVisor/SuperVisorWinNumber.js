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

import { Loading } from "components/Loading/Loading.js";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

const WinNumber = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [winningNumbers, setWinningNumbers] = useState([]);
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));

  const [loading, setLoading] = useState(false);

  const fetchWinningNumbers = async () => {
    try {
      setLoading(true);
      const response = await api().post("superVisor/getwiningnumber", {
        lotteryCategoryName: "",
        fromDate,
        toDate,
      });
      console.log(response.data.data);
      setWinningNumbers(response.data.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching winning numbers",
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
        >
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="space-between"
            width="100%"
          >
            <Text fontSize="lg" font="Weight:bold">
              Winning Number
            </Text>
            <Flex
              flexWrap="wrap"
              flexDirection={{ base: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={"center"}
            >
              <FormControl id="fromDate" width="250px" isRequired>
                <HStack justifyContent="space-between">
                  <FormLabel p="10px" m="0">
                    From
                  </FormLabel>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    width="180px"
                  />
                </HStack>
              </FormControl>
              <FormControl id="toDate" width="250px" isRequired>
                <HStack justifyContent="space-between">
                  <FormLabel p="10px" m="0">
                    To
                  </FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    width="180px"
                  />
                </HStack>
              </FormControl>
              <Button
                size="sm"
                onClick={fetchWinningNumbers}
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
            <Table variant="striped" color="black">
              <Thead>
                <Tr>
                  <Th color="black">Date</Th>
                  <Th color="black">Lottery</Th>
                  <Th color="black">L3C</Th>
                  <Th color="black">Second</Th>
                  <Th color="black">Third</Th>
                </Tr>
              </Thead>
              {loading ? (
                <Tbody>
                  <Tr>
                    <Td colSpan={5}>
                      <Loading />
                    </Td>
                  </Tr>
                </Tbody>
              ) : (
                <Tbody>
                  {winningNumbers?.map((game, gameIndex) => (
                    <Tr key={gameIndex}>
                      <Td>
                        <pre>{formatDate(game?.date.substr(0, 10))}</pre>
                      </Td>
                      <Td>
                        <pre>{game.lotteryName}</pre>
                      </Td>
                      <Td>
                        <pre>{game.numbers.l3c}</pre>
                      </Td>
                      <Td>
                        <pre>{game.numbers.second}</pre>
                      </Td>
                      <Td>
                        <pre>{game.numbers.third}</pre>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              )}
            </Table>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default WinNumber;
