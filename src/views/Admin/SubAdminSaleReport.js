import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js"; // Ensure this is correctly configured to include auth tokens
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
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Box,
  useToast,
  useColorMode,
  Spinner,
  NumberInput,
  NumberInputField,
  VStack,
  HStack, // Import HStack here
} from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

// Custom components (ensure these are correctly implemented)
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import { Loading } from "components/Loading/Loading.js";

const AdminSaleReports = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  // State Variables
  const [subadmins, setSubadmins] = useState([]);
  const [selectedSubadminId, setSelectedSubadminId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [lotteryCategoryName, setLotteryCategoryName] = useState([]);
  const [chargePerSeller, setChargePerSeller] = useState(0);
  const [totalCharge, setTotalCharge] = useState(0);
  const [qualifyingSellers, setQualifyingSellers] = useState([]);
  const [totalQualifyingSellers, setTotalQualifyingSellers] = useState(0);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Subadmins on Component Mount
  useEffect(() => {
    const fetchSubadmins = async () => {
      try {
        const response = await api().get("/admin/getsubadmin");
        setSubadmins(response.data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching subadmins",
          description: error.response?.data?.message || "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        setLotteryCategoryName(response.data.data);
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

    const initializeDates = () => {
      const today = new Date();
      const firstDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const lastDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );
      setFromDate(firstDayLastMonth.toISOString().split("T")[0]);
      setToDate(lastDayLastMonth.toISOString().split("T")[0]);
    };

    fetchSubadmins();
    fetchLotteryCategories();
    initializeDates();
  }, []);

  // Fetch Reports Function
  const fetchReports = async () => {
    if (!selectedSubadminId) {
      toast({
        title: "Please select a Subadmin.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(
        `/admin/getsubadminsalereports?subadminId=${selectedSubadminId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${lotteryCategoryName}&minSales=20000`
      );
      console.log(response.data);
      if (response.data.success) {
        const { sellers, totalQualifyingSellers } = response.data.data;
        setQualifyingSellers(sellers);
        setTotalQualifyingSellers(totalQualifyingSellers);
        setTotalCharge(totalQualifyingSellers * chargePerSeller);

        setSellerInfo(
          ...totalQualifyingSellers,
          ...sellers,
          ...(totalQualifyingSellers * chargePerSeller)
        );
      } else {
        toast({
          title: "Failed to fetch sale reports",
          description: response.data.message || "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setQualifyingSellers([]);
        setTotalQualifyingSellers(0);
        setTotalCharge(0);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching sale reports",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setQualifyingSellers([]);
      setTotalQualifyingSellers(0);
      setTotalCharge(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle Charge Per Seller Change
  const handleChargeChange = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) {
      toast({
        title: "Invalid charge amount",
        description: "Please enter a valid positive number.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setChargePerSeller(numericValue);
    setTotalCharge(numericValue * totalQualifyingSellers);
  };

  // Handle Generate Invoice for Total Charge
  const handleGenerateInvoice = () => {
    if (totalCharge === 0) {
      toast({
        title: "Total charge is zero",
        description: "No charge to generate invoice.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Subadmin Charge Invoice", 14, 22);

    doc.setFontSize(12);
    doc.text(`Subadmin ID: ${selectedSubadminId}`, 14, 32);
    doc.text(`From Date: ${fromDate}`, 14, 40);
    doc.text(`To Date: ${toDate}`, 14, 48);
    doc.text(`Number of Qualifying Sellers: ${totalQualifyingSellers}`, 14, 56);
    doc.text(`Charge per Seller: ₹${chargePerSeller.toFixed(2)}`, 14, 64);
    doc.text(`Total Charge: ₹${totalCharge.toFixed(2)}`, 14, 72);

    // Optional: Add table of sellers
    if (qualifyingSellers.length > 0) {
      doc.autoTable({
        startY: 80,
        head: [
          ["Seller Name", "Total Sales (₹)", "Paid Amount (₹)", "Profit (₹)"],
        ],
        body: qualifyingSellers.map((seller) => [
          seller.sellerName,
          seller.totalSales.toFixed(2),
          seller.paidAmount.toFixed(2),
          (seller.totalSales - seller.paidAmount).toFixed(2),
        ]),
      });
    }

    doc.save(`Subadmin_Charge_Invoice_${selectedSubadminId}.pdf`);
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
              {/* Subadmin Selection */}

              <FormControl id="subadmin" width="330px" isRequired pl={5}>
                <HStack justifyContent="space-between">
                  <FormLabel>Select Subadmin </FormLabel>
                  <Select
                    placeholder="Select Subadmin"
                    value={selectedSubadminId}
                    onChange={(e) => setSelectedSubadminId(e.target.value)}
                  >
                    {subadmins.map((subadmin) => (
                      <option key={subadmin._id} value={subadmin._id}>
                        {subadmin.userName}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>
              <FormControl
                id="lotteryCategoryName"
                width="350px"
                isRequired
                pl={10}
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel>Category</FormLabel>
                  <Select
                    onChange={(event) =>
                      setLotteryCategoryName(event.target.value)
                    }
                    placeholder="Select Category"
                    width="200px"
                  >
                    <option value={""} style={{ backgroundColor: "#e3e2e2" }}>
                      All
                    </option>
                    {lotteryCategoryName.map((category) => (
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

              {/* Date Range Selection */}
              <FormControl id="fromDate" width="330px" isRequired py="5px">
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
                width="330px"
                isRequired
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel>To</FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>

              {/* Lottery Category Name (Optional) */}
              {/* Lottery Category Selection */}

              {/* Charge per Seller Input */}
              <FormControl id="chargePerSeller" width="330px" isRequired>
                <HStack justifyContent="space-between">
                  <FormLabel>Charge P/S ($)</FormLabel>
                  <NumberInput
                    min={0}
                    precision={2}
                    value={chargePerSeller}
                    onChange={handleChargeChange}
                  >
                    <NumberInputField placeholder="Enter charge amount" />
                  </NumberInput>
                </HStack>
              </FormControl>

              {/* Fetch Reports Button */}
              <Button
                ml={10}
                leftIcon={<CgSearch />}
                colorScheme="teal"
                onClick={fetchReports}
                isLoading={loading}
                loadingText="Fetching"
              ></Button>
              {/* Display Metrics */}
            </Flex>
            <Box>
              {/* <Text fontSize="lg" fontWeight="medium">
                      Number of Qualifying Sellers: {totalQualifyingSellers}
                    </Text>
                    <Text fontSize="lg" fontWeight="medium">
                      Total Charge: ₹{totalCharge.toFixed(2)}
                    </Text> */}
              <Button
                mt={2}
                colorScheme="blue"
                onClick={handleGenerateInvoice}
                isDisabled={totalCharge === 0}
              >
                Generate Invoice
              </Button>
            </Box>
          </Flex>
        </CardHeader>
        <CardBody>
          {/* Qualifying Sellers Table */}

          <Table variant="striped" colorScheme="gray"></Table>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default AdminSaleReports;
