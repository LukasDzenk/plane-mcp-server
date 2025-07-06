import { z } from "zod";
import { makePlaneRequest } from "../common/request-helper.js";
export const registerProjectTools = (server) => {
    server.tool("get_projects", "Get all projects for the current user", {}, async () => {
        const projectsResponse = await makePlaneRequest("GET", `workspaces/${process.env.PLANE_WORKSPACE_SLUG}/projects/`);
        const projects = projectsResponse.results.map((project) => ({
            name: project.name,
            id: project.id,
            identifier: project.identifier,
            description: project.description,
            project_lead: project.project_lead,
        }));
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(projects, null, 2),
                },
            ],
        };
    });
    server.tool("create_project", "Create a new project", {
        name: z.string().describe("The name of the project"),
        identifier: z
            .string()
            .max(7)
            .describe("The identifier of the project. This is typically a word of around 5 characters derived from the name of the project in uppercase."),
    }, async ({ name, identifier }) => {
        const project = await makePlaneRequest("POST", `workspaces/${process.env.PLANE_WORKSPACE_SLUG}/projects/`, {
            name,
            identifier: identifier.toUpperCase().replaceAll(" ", ""),
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(project, null, 2),
                },
            ],
        };
    });
};
