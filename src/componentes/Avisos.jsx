import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Heading,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = import.meta.env.VITE_API_URL;

const Avisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [avisoEdit, setAvisoEdit] = useState(null);
  const toast = useToast();
  const idIgreja = sessionStorage.getItem("idIgreja");

  const loadAvisos = async () => {
    try {
      const res = await axios.get(`${API_URL}/avisos`, {
        headers: { "X-Igreja-Id": idIgreja },
      });
      setAvisos(res.data);
    } catch {
      toast({
        title: "Erro ao carregar avisos",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (idIgreja) loadAvisos();
  }, [idIgreja]);

  const openModal = (aviso = null) => {
    if (aviso) {
      setAvisoEdit(aviso);
      setTitulo(aviso.titulo);
      setMensagem(aviso.mensagem);
    } else {
      setAvisoEdit(null);
      setTitulo("");
      setMensagem("");
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const salvarAviso = async () => {
    try {
      if (avisoEdit) {
        await axios.put(
          `${API_URL}/avisos/${avisoEdit._id}`,
          { titulo, mensagem },
          { headers: { "X-Igreja-Id": idIgreja } }
        );
        toast({ title: "Aviso atualizado!", status: "success" });
      } else {
        await axios.post(
          `${API_URL}/avisos`,
          { titulo, mensagem },
          { headers: { "X-Igreja-Id": idIgreja } }
        );
        toast({ title: "Aviso criado!", status: "success" });
      }

      closeModal();
      loadAvisos();
    } catch {
      toast({ title: "Erro ao salvar aviso", status: "error" });
    }
  };

  const deletarAviso = async (id) => {
    if (!window.confirm("Deseja realmente excluir este aviso?")) return;
    try {
      await axios.delete(`${API_URL}/avisos/${id}`, {
        headers: { "X-Igreja-Id": idIgreja },
      });
      toast({ title: "Aviso excluído!", status: "success" });
      loadAvisos();
    } catch {
      toast({ title: "Erro ao excluir aviso", status: "error" });
    }
  };

  return (
    <Box maxW="1200px" mx="auto" py={6} px={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="blue.700">
          Avisos
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => openModal()}
        >
          Novo Aviso
        </Button>
      </Flex>

      <Grid templateColumns={["1fr", "repeat(2, 1fr)"]} gap={5}>
        {avisos.map((aviso) => (
          <Box
            key={aviso._id}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            p={5}
            borderLeft="5px solid"
            borderColor="blue.500"
            _hover={{ boxShadow: "md" }}
            transition="0.2s"
          >
            <Stack spacing={3}>
              <Heading size="md" color="gray.800">
                {aviso.titulo}
              </Heading>

              <Text color="gray.600" fontSize="sm">
                {aviso.mensagem}
              </Text>

              <Divider />

              <Flex justify="flex-end" gap={2}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<EditIcon />}
                  onClick={() => openModal(aviso)}
                >
                  Editar
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                  onClick={() => deletarAviso(aviso._id)}
                >
                  Excluir
                </Button>
              </Flex>
            </Stack>
          </Box>
        ))}
      </Grid>

      {/* Modal Criar / Editar */}
      <Modal isOpen={modalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>
            {avisoEdit ? "Editar Aviso" : "Novo Aviso"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Input
                placeholder="Título do aviso"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <Textarea
                placeholder="Mensagem do aviso"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={5}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={salvarAviso}
            >
              {avisoEdit ? "Salvar Alterações" : "Criar Aviso"}
            </Button>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Avisos;
