import { useState } from "react";
import {
  Box,
  VStack,
  Text,
  IconButton,
  Stack,
  Link,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { MdCalendarToday, MdDashboard } from "react-icons/md";
import { FaDollarSign, FaUsers } from "react-icons/fa";
import { GiWaterDrop } from "react-icons/gi"; // Batismo
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const MenuItem = ({ icon, label, path }) => (
    <Link
      display="flex"
      alignItems="center"
      gap={3}
      p={3}
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: "blue.600" }}
      onClick={() => handleNavigation(path)}
    >
      {icon}
      <Text fontSize="sm">{label}</Text>
    </Link>
  );

  return (
    <>
      {/* Botão mobile */}
      <IconButton
        aria-label="Abrir menu"
        icon={<HamburgerIcon />}
        variant="outline"
        display={{ base: "block", md: "none" }}
        position="fixed"
        top={4}
        left={4}
        zIndex={10}
        onClick={toggleSidebar}
      />

      {/* Sidebar Desktop */}
      <Box
        w="200px"
        bg="blue.500"
        color="white"
        minH="100vh"
        p={5}
        position="fixed"
        left={0}
        top={0}
        display={{ base: "none", md: "block" }}
        boxShadow="lg"
      >
        <VStack spacing={8} align="stretch">
          <Text fontSize="xl" fontWeight="bold" textAlign="center">
            Dashboard
          </Text>

          <Stack spacing={1}>
            <MenuItem
              icon={<MdDashboard size={20} />}
              label="Início"
              path="/"
            />
            <MenuItem
              icon={<FaUsers size={18} />}
              label="Membros"
              path="/membros"
            />
            <MenuItem
              icon={<FaDollarSign size={18} />}
              label="Dízimos"
              path="/dizimos"
            />
            <MenuItem
              icon={<MdCalendarToday size={18} />}
              label="Eventos"
              path="/eventos"
            />
            <MenuItem
              icon={<GiWaterDrop size={18} />}
              label="Batismo"
              path="/batismo"
            />
          </Stack>
        </VStack>
      </Box>

      {/* Sidebar Mobile */}
      <Drawer placement="left" onClose={toggleSidebar} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody bg="blue.500" color="white" p={5}>
            <VStack spacing={6} align="stretch">
              <Text fontSize="xl" fontWeight="bold" textAlign="center">
                Dashboard
              </Text>

              <Stack spacing={1}>
                <MenuItem
                  icon={<MdDashboard size={20} />}
                  label="Início"
                  path="/"
                />
                <MenuItem
                  icon={<FaUsers size={18} />}
                  label="Membros"
                  path="/membros"
                />
                <MenuItem
                  icon={<FaDollarSign size={18} />}
                  label="Dízimos"
                  path="/dizimos"
                />
                <MenuItem
                  icon={<MdCalendarToday size={18} />}
                  label="Eventos"
                  path="/eventos"
                />
                <MenuItem
                  icon={<GiWaterDrop size={18} />}
                  label="Batismo"
                  path="/batismo"
                />
              </Stack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
