import { useState, useEffect, Fragment } from "react";
import api from "../../utils/customFetch.js";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
import { Loading } from "components/Loading/Loading.js";

const SaleReports = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [saleReports, setSaleReports] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [paidAmount, setPaidAmount] = useState(0);
  const [sumAmount, setSumAmount] = useState(0);

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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api().get(
        `/subadmin/getsalereports?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${lotteryCategoryName.trim()}`
      );
      console.log(response.data);
      const responseData = response.data.data;
      setSumAmount(
        Object.values(responseData).reduce(
          (acc, sellerData) => acc + sellerData.sum,
          0
        )
      );
      setPaidAmount(
        Object.values(responseData).reduce(
          (acc, sellerData) => acc + sellerData.paid,
          0
        )
      );
      setSaleReports(responseData);
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

  const handleGenerateInvoice = (sellerData) => {
    const doc = new jsPDF();

    doc.text("Invoice Summary", 15, 20);
    doc.text(sellerData.name, 15, 27);
    // Add a table for the specific seller's details
    doc.autoTable({
      head: [["Description", "Amount"]],
      body: [
        ["Total Sales", sellerData.sum],
        ["Paid Amount", sellerData.paid],
        ["Profit", sellerData.sum - sellerData.paid],
      ],
      startY: 50,
    });

    // Save the PDF with the seller's name
    doc.save(`${sellerData.name}-invoice.pdf`);
  };

  const handleGenerateInvoiceForAll = () => {
    const doc = new jsPDF();

    // Add invoice content for all sellers
    doc.text("Invoice Summary", 15, 10);
    doc.autoTable({
      head: [["Seller Name", "Total Sales", "Paid Amount", "Profit"]],
      body: Object.values(saleReports).map((sellerData) => [
        sellerData.name,
        sellerData.sum,
        sellerData.paid,
        sellerData.sum - sellerData.paid,
      ]),
    });

    // Add totals at the bottom of the table
    doc.text(
      `Total Sellers: ${Object.values(saleReports).length}`,
      15,
      doc.autoTable.previous.finalY + 5
    );
    doc.text(
      `Total Sales: ${sumAmount}`,
      15,
      doc.autoTable.previous.finalY + 10
    );
    doc.text(
      `Paid Amount: ${paidAmount}`,
      15,
      doc.autoTable.previous.finalY + 15
    );
    doc.text(
      `Profit: ${sumAmount - paidAmount}`,
      15,
      doc.autoTable.previous.finalY + 20
    );

    // Save the PDF
    doc.save("SalesReport-Invoice.pdf");
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
        width={{ base: "100%", md: "80%", lg: "60%" }} // Responsive width
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
              Sale Reports
            </Text>
            <Flex
              color="black"
              flexWrap="wrap"
              flexDirection={{ base: "column", sm: "row" }}
              justifyContent="flex-start"
              width="100%"
              alignItems="center"
            >
              <FormControl
                id="lotteryCategoryName"
                width="320px"
                isRequired
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel>Seller</FormLabel>
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
                width="320px"
                isRequired
                py="5px"
                pl={7}
              >
                <HStack justifyContent="space-between">
                  <FormLabel>Category</FormLabel>
                  <Select
                    onChange={(event) =>
                      setLotteryCategoryName(event.target.value)
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
              <FormControl id="fromDate" width="320px" isRequired py="5px">
                <HStack justifyContent="space-between">
                  <FormLabel>From</FormLabel>
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
                width="320px"
                isRequired
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel>To</FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    width="190px"
                  />
                </HStack>
              </FormControl>

              <Button
                size="sm"
                onClick={fetchReports}
                bg={colorMode === "light" ? "red.600" : "blue.300"}
                _hover={{
                  bg: colorMode === "light" ? "red.500" : "blue.200",
                }}
                ml={"10px"}
              >
                <CgSearch size={20} color={"white"} />
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateInvoiceForAll}
                bg={colorMode === "light" ? "red.600" : "blue.300"}
                _hover={{
                  bg: colorMode === "light" ? "red.500" : "blue.200",
                }}
                justifyContent={"center"}
                ml={"10px"}
              >
                Generate Invoice
              </Button>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody pb="15px">
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th>Seller Name</Th>
                <Th>Total</Th>
                <Th>Paid</Th>
                <Th>Profit</Th>
                <Th>Invoice</Th>
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
              <>
                <Tbody>
                  {Object.values(saleReports).map((sellerData) => (
                    <Tr key={sellerData.name}>
                      <Td>
                        <pre>{sellerData.name}</pre>
                      </Td>
                      <Td>
                        <pre>{sellerData.sum}</pre>
                      </Td>
                      <Td>
                        <pre>{sellerData.paid}</pre>
                      </Td>
                      <Td>
                        <pre>{sellerData.sum - sellerData.paid}</pre>
                      </Td>
                      <Td>
                        {/* Add invoice button */}
                        <Button
                          onClick={() => handleGenerateInvoice(sellerData)}
                        >
                          Export Invoice
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <Thead>
                  <Tr>
                    <Th>Total ({Object.values(saleReports).length})</Th>
                    <Th>{sumAmount}</Th>
                    <Th> {paidAmount}</Th>
                    <Th>{sumAmount - paidAmount}</Th>
                    <Th></Th> {/* Empty for invoice column */}
                  </Tr>
                </Thead>
              </>
            )}
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default SaleReports;
