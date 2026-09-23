import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Image,
  Input,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import {
  FaBuilding,
  FaChurch,
  FaImage,
  FaSave,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const ESTADO_INICIAL = {
  nome: "",
  email: "",
  pastorPresidente: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  uf: "",
  cep: "",
  telefone: "",
  logoIgreja: "",
  logoConvencao: "",
};

const Configuracoes = () => {
  const [dados, setDados] =
    useState(ESTADO_INICIAL);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const inputLogoIgrejaRef =
    useRef(null);

  const inputLogoConvencaoRef =
    useRef(null);

  const toast = useToast();

  const idIgreja =
    sessionStorage.getItem("idIgreja") || "";

  /*
   * Atualiza um campo simples.
   */
  const atualizarCampo = (
    campo,
    valor
  ) => {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  };

  /*
   * Carrega as configurações
   * da igreja logada.
   */
  const carregarConfiguracoes =
    useCallback(async () => {
      if (!idIgreja) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);

        const response = await axios.get(
          `${API_URL}/api/igreja/configuracoes`,
          {
            headers: {
              "X-Igreja-Id":
                idIgreja,
            },
          }
        );

        const igreja =
          response.data?.igreja ||
          response.data ||
          {};

        setDados({
          nome:
            igreja.nome || "",

          email:
            igreja.email || "",

          pastorPresidente:
            igreja.pastorPresidente ||
            "",

          endereco:
            igreja.endereco || "",

          numero:
            igreja.numero || "",

          bairro:
            igreja.bairro || "",

          cidade:
            igreja.cidade || "",

          uf:
            igreja.uf || "",

          cep:
            igreja.cep || "",

          telefone:
            igreja.telefone || "",

          logoIgreja:
            igreja.logoIgreja || "",

          logoConvencao:
            igreja.logoConvencao ||
            "",
        });
      } catch (error) {
        console.error(
          "Erro ao carregar configurações:",
          error
        );

        toast({
          title:
            "Erro ao carregar configurações",
          description:
            error.response?.data
              ?.message ||
            "Não foi possível carregar os dados da igreja.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setCarregando(false);
      }
    }, [idIgreja, toast]);

  useEffect(() => {
    carregarConfiguracoes();
  }, [carregarConfiguracoes]);

  /*
   * Converte arquivo para Base64.
   */
  const arquivoParaBase64 = (
    arquivo
  ) => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Erro ao ler imagem"
            )
          );
        };

        reader.readAsDataURL(
          arquivo
        );
      }
    );
  };

  /*
   * Processa a logo escolhida.
   */
  const selecionarImagem =
    async (event, campo) => {
      const arquivo =
        event.target.files?.[0];

      if (!arquivo) {
        return;
      }

      const tiposPermitidos = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (
        !tiposPermitidos.includes(
          arquivo.type
        )
      ) {
        toast({
          title:
            "Formato não permitido",
          description:
            "Envie uma imagem PNG, JPG, JPEG ou WEBP.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });

        event.target.value = "";

        return;
      }

      /*
       * Máximo de 2 MB.
       *
       * Para a primeira versão,
       * vamos salvar a imagem
       * como Base64.
       */
      const LIMITE =
        2 * 1024 * 1024;

      if (
        arquivo.size > LIMITE
      ) {
        toast({
          title:
            "Imagem muito grande",
          description:
            "A imagem deve ter no máximo 2 MB.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });

        event.target.value = "";

        return;
      }

      try {
        const base64 =
          await arquivoParaBase64(
            arquivo
          );

        atualizarCampo(
          campo,
          base64
        );
      } catch (error) {
        console.error(
          "Erro ao carregar imagem:",
          error
        );

        toast({
          title:
            "Erro ao carregar imagem",
          description:
            "Não foi possível processar o arquivo selecionado.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }

      event.target.value = "";
    };

  /*
   * Remove uma logo.
   */
  const removerLogo = (campo) => {
    atualizarCampo(
      campo,
      ""
    );
  };

  /*
   * Salvar configurações.
   */
  const salvarConfiguracoes =
    async () => {
      if (!dados.nome.trim()) {
        toast({
          title:
            "Nome da igreja obrigatório",
          description:
            "Informe o nome oficial da igreja.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });

        return;
      }

      try {
        setSalvando(true);

        const payload = {
          nome:
            dados.nome.trim(),

          pastorPresidente:
            dados.pastorPresidente.trim(),

          endereco:
            dados.endereco.trim(),

          numero:
            dados.numero.trim(),

          bairro:
            dados.bairro.trim(),

          cidade:
            dados.cidade.trim(),

          uf:
            dados.uf
              .trim()
              .toUpperCase(),

          cep:
            dados.cep.trim(),

          telefone:
            dados.telefone.trim(),

          /*
           * O e-mail já existe no
           * cadastro da igreja.
           *
           * Vamos enviar também,
           * mas o backend pode decidir
           * se permite alterá-lo.
           */
          email:
            dados.email.trim(),

          logoIgreja:
            dados.logoIgreja,

          logoConvencao:
            dados.logoConvencao,
        };

        const response =
          await axios.put(
            `${API_URL}/api/igreja/configuracoes`,
            payload,
            {
              headers: {
                "X-Igreja-Id":
                  idIgreja,
              },
            }
          );

        const igrejaAtualizada =
          response.data?.igreja;

        if (igrejaAtualizada) {
          setDados(
            (dadosAtuais) => ({
              ...dadosAtuais,
              ...igrejaAtualizada,

              logoIgreja:
                igrejaAtualizada
                  .logoIgreja ??
                dadosAtuais.logoIgreja,

              logoConvencao:
                igrejaAtualizada
                  .logoConvencao ??
                dadosAtuais.logoConvencao,
            })
          );
        }

        toast({
          title:
            "Configurações salvas",
          description:
            "Os dados da igreja foram atualizados com sucesso.",
          status: "success",
          duration: 3500,
          isClosable: true,
        });
      } catch (error) {
        console.error(
          "Erro ao salvar configurações:",
          error
        );

        toast({
          title:
            "Erro ao salvar configurações",
          description:
            error.response?.data
              ?.message ||
            "Não foi possível salvar os dados da igreja.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setSalvando(false);
      }
    };

  /*
   * Componente das logos.
   */
  const BlocoLogo = ({
    titulo,
    descricao,
    valor,
    campo,
    inputRef,
    icone,
  }) => (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      p={5}
      bg="white"
      boxShadow="sm"
      flex="1"
    >
      <Flex
        align="center"
        gap={3}
        mb={4}
      >
        <Box
          color="blue.500"
          fontSize="22px"
        >
          {icone}
        </Box>

        <Box>
          <Text
            fontWeight="bold"
            fontSize="lg"
          >
            {titulo}
          </Text>

          <Text
            fontSize="sm"
            color="gray.500"
          >
            {descricao}
          </Text>
        </Box>
      </Flex>

      <Flex
        minH="170px"
        align="center"
        justify="center"
        bg="gray.50"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="gray.300"
        borderRadius="lg"
        p={4}
        mb={4}
      >
        {valor ? (
          <Image
            src={valor}
            alt={titulo}
            maxW="210px"
            maxH="140px"
            objectFit="contain"
          />
        ) : (
          <Stack
            align="center"
            spacing={2}
            color="gray.400"
          >
            <FaImage size={42} />

            <Text
              fontSize="sm"
              textAlign="center"
            >
              Nenhuma imagem
              cadastrada
            </Text>
          </Stack>
        )}
      </Flex>

      <Input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        display="none"
        onChange={(event) =>
          selecionarImagem(
            event,
            campo
          )
        }
      />

      <Flex
        gap={2}
        wrap="wrap"
      >
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={
            <FaUpload />
          }
          onClick={() =>
            inputRef.current?.click()
          }
        >
          {valor
            ? "Trocar imagem"
            : "Enviar imagem"}
        </Button>

        {valor && (
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            leftIcon={
              <FaTrash />
            }
            onClick={() =>
              removerLogo(campo)
            }
          >
            Remover
          </Button>
        )}
      </Flex>

      <Text
        mt={3}
        fontSize="xs"
        color="gray.500"
      >
        PNG, JPG ou WEBP. Máximo
        de 2 MB.
      </Text>
    </Box>
  );

  if (carregando) {
    return (
      <Flex
        w="100%"
        minH="100vh"
        align="center"
        justify="center"
      >
        <Stack
          align="center"
          spacing={4}
        >
          <Spinner
            size="xl"
            color="blue.500"
            thickness="4px"
          />

          <Text color="gray.600">
            Carregando configurações...
          </Text>
        </Stack>
      </Flex>
    );
  }

  return (
    <Box
      w="100%"
      maxW="1200px"
      mx="auto"
      p={{
        base: 4,
        md: 8,
      }}
    >
      {/* CABEÇALHO */}

      <Flex
        justify="space-between"
        align={{
          base: "flex-start",
          md: "center",
        }}
        direction={{
          base: "column",
          md: "row",
        }}
        gap={4}
        mb={8}
      >
        <Box>
          <Flex
            align="center"
            gap={3}
            mb={2}
          >
            <Box
              color="blue.500"
              fontSize="28px"
            >
              <FaChurch />
            </Box>

            <Heading
              size="lg"
              color="blue.600"
            >
              Configurações da Igreja
            </Heading>
          </Flex>

          <Text
            color="gray.600"
            maxW="700px"
          >
            Configure os dados que serão
            usados automaticamente nas
            cartas, cartões e documentos
            da igreja.
          </Text>
        </Box>

        <Button
          colorScheme="blue"
          leftIcon={<FaSave />}
          size="lg"
          isLoading={salvando}
          loadingText="Salvando"
          onClick={
            salvarConfiguracoes
          }
        >
          Salvar alterações
        </Button>
      </Flex>

      {/* LOGOS */}

      <Heading
        size="md"
        mb={4}
      >
        Identidade visual
      </Heading>

      <Grid
        templateColumns={{
          base: "1fr",
          lg: "repeat(2, 1fr)",
        }}
        gap={5}
        mb={8}
      >
        <BlocoLogo
          titulo="Logo da Igreja"
          descricao="Logo principal que aparecerá nos documentos."
          valor={dados.logoIgreja}
          campo="logoIgreja"
          inputRef={
            inputLogoIgrejaRef
          }
          icone={<FaChurch />}
        />

        <BlocoLogo
          titulo="Logo da Convenção"
          descricao="Logo da convenção à qual a igreja pertence."
          valor={
            dados.logoConvencao
          }
          campo="logoConvencao"
          inputRef={
            inputLogoConvencaoRef
          }
          icone={<FaBuilding />}
        />
      </Grid>

      {/* DADOS */}

      <Box
        bg="white"
        borderWidth="1px"
        borderRadius="xl"
        boxShadow="sm"
        p={{
          base: 5,
          md: 7,
        }}
      >
        <Heading
          size="md"
          mb={2}
        >
          Dados da Igreja
        </Heading>

        <Text
          color="gray.500"
          fontSize="sm"
          mb={6}
        >
          Essas informações poderão ser
          exibidas nas cartas e demais
          documentos emitidos pelo
          sistema.
        </Text>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
          }}
          gap={5}
        >
          <FormControl
            isRequired
            gridColumn={{
              md: "span 2",
            }}
          >
            <FormLabel>
              Nome oficial da igreja
            </FormLabel>

            <Input
              value={dados.nome}
              placeholder="Ex.: Igreja Evangélica Assembleia de Deus"
              onChange={(event) =>
                atualizarCampo(
                  "nome",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              Pastor Presidente
            </FormLabel>

            <Input
              value={
                dados.pastorPresidente
              }
              placeholder="Ex.: Pr. Marcos Vinícius S. Costa"
              onChange={(event) =>
                atualizarCampo(
                  "pastorPresidente",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              Telefone
            </FormLabel>

            <Input
              value={
                dados.telefone
              }
              placeholder="Ex.: (98) 99999-9999"
              onChange={(event) =>
                atualizarCampo(
                  "telefone",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              Endereço
            </FormLabel>

            <Input
              value={
                dados.endereco
              }
              placeholder="Ex.: Rua do Comércio"
              onChange={(event) =>
                atualizarCampo(
                  "endereco",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              Número
            </FormLabel>

            <Input
              value={dados.numero}
              placeholder="Ex.: 90"
              onChange={(event) =>
                atualizarCampo(
                  "numero",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              Bairro
            </FormLabel>

            <Input
              value={
                dados.bairro
              }
              placeholder="Ex.: Centro"
              onChange={(event) =>
                atualizarCampo(
                  "bairro",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              CEP
            </FormLabel>

            <Input
              value={dados.cep}
              placeholder="Ex.: 65165-000"
              onChange={(event) =>
                atualizarCampo(
                  "cep",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              Cidade
            </FormLabel>

            <Input
              value={
                dados.cidade
              }
              placeholder="Ex.: Cachoeira Grande"
              onChange={(event) =>
                atualizarCampo(
                  "cidade",
                  event.target.value
                )
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              UF
            </FormLabel>

            <Input
              value={dados.uf}
              maxLength={2}
              placeholder="MA"
              textTransform="uppercase"
              onChange={(event) =>
                atualizarCampo(
                  "uf",
                  event.target.value
                    .toUpperCase()
                    .replace(
                      /[^A-Z]/g,
                      ""
                    )
                )
              }
            />
          </FormControl>
        </Grid>

        <Divider my={7} />

        <Heading
          size="sm"
          mb={4}
        >
          Contato
        </Heading>

        <FormControl>
          <FormLabel>
            E-mail da igreja
          </FormLabel>

          <Input
            type="email"
            value={dados.email}
            placeholder="igreja@email.com"
            onChange={(event) =>
              atualizarCampo(
                "email",
                event.target.value
              )
            }
          />

          <Text
            fontSize="xs"
            color="gray.500"
            mt={2}
          >
            Este é o e-mail cadastrado
            para a igreja. Depois podemos
            separar o e-mail de login do
            e-mail público exibido nos
            documentos.
          </Text>
        </FormControl>

        {/* PREVIEW */}

        <Divider my={7} />

        <Heading
          size="sm"
          mb={4}
        >
          Prévia do perfil
        </Heading>

        <Flex
          bg="gray.50"
          borderWidth="1px"
          borderRadius="lg"
          p={5}
          align={{
            base: "flex-start",
            md: "center",
          }}
          direction={{
            base: "column",
            md: "row",
          }}
          gap={5}
        >
          {dados.logoIgreja ? (
            <Image
              src={
                dados.logoIgreja
              }
              alt="Logo da igreja"
              w="85px"
              h="85px"
              objectFit="contain"
            />
          ) : (
            <Avatar
              size="xl"
              icon={<FaChurch />}
              bg="blue.100"
              color="blue.600"
            />
          )}

          <Box>
            <Text
              fontWeight="bold"
              fontSize="xl"
              color="gray.800"
            >
              {dados.nome ||
                "Nome da Igreja"}
            </Text>

            {dados.pastorPresidente && (
              <Text
                color="gray.600"
                mt={1}
              >
                Presidente:{" "}
                {
                  dados.pastorPresidente
                }
              </Text>
            )}

            <Text
              color="gray.600"
              mt={1}
            >
              {[
                dados.endereco,
                dados.numero,
                dados.bairro,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>

            <Text color="gray.600">
              {dados.cidade}

              {dados.cidade &&
              dados.uf
                ? "/"
                : ""}

              {dados.uf}
            </Text>

            {dados.telefone && (
              <Text
                color="gray.600"
                mt={1}
              >
                {
                  dados.telefone
                }
              </Text>
            )}

            {dados.email && (
              <Text color="gray.600">
                {dados.email}
              </Text>
            )}
          </Box>
        </Flex>

        <Flex
          justify="flex-end"
          mt={7}
        >
          <Button
            colorScheme="blue"
            leftIcon={<FaSave />}
            size="lg"
            isLoading={salvando}
            loadingText="Salvando"
            onClick={
              salvarConfiguracoes
            }
          >
            Salvar alterações
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Configuracoes;